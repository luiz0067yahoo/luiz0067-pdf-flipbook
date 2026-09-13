/**
 * Luiz0067 PDF Flipbook - Frontend View Script
 * Motor responsivo de visualização 3D de PDFs e revistas digitais
 * Autor: Luiz Fernando Brogliatto Ferreira
 */

( function () {
	'use strict';

	// Web Audio API sintetizador de som de folha de papel virando
	class PaperSoundSynthesizer {
		constructor() {
			this.audioCtx = null;
			this.enabled = true;
		}

		initContext() {
			if ( ! this.audioCtx && ( window.AudioContext || window.webkitAudioContext ) ) {
				const AudioContextClass = window.AudioContext || window.webkitAudioContext;
				this.audioCtx = new AudioContextClass();
			}
			if ( this.audioCtx && this.audioCtx.state === 'suspended' ) {
				this.audioCtx.resume();
			}
		}

		play() {
			if ( ! this.enabled ) {
				return;
			}
			try {
				this.initContext();
				if ( ! this.audioCtx ) {
					return;
				}

				const now = this.audioCtx.currentTime;
				const duration = 0.18; // Duração sutil do som de folheamento

				// Gerador de ruído branco para simular a textura acústica do papel
				const bufferSize = this.audioCtx.sampleRate * duration;
				const buffer = this.audioCtx.createBuffer( 1, bufferSize, this.audioCtx.sampleRate );
				const data = buffer.getChannelData( 0 );
				for ( let i = 0; i < bufferSize; i++ ) {
					data[ i ] = ( Math.random() * 2 - 1 ) * Math.exp( -i / ( bufferSize * 0.45 ) );
				}

				const noise = this.audioCtx.createBufferSource();
				noise.buffer = buffer;

				// Filtro Bandpass dinâmico simulando atrito
				const filter = this.audioCtx.createBiquadFilter();
				filter.type = 'bandpass';
				filter.frequency.setValueAtTime( 1200, now );
				filter.frequency.exponentialRampToValueAtTime( 2800, now + duration * 0.5 );
				filter.frequency.exponentialRampToValueAtTime( 900, now + duration );
				filter.Q.setValueAtTime( 3.0, now );

				// Ganho com fade out suave
				const gainNode = this.audioCtx.createGain();
				gainNode.gain.setValueAtTime( 0.25, now );
				gainNode.gain.exponentialRampToValueAtTime( 0.001, now + duration );

				noise.connect( filter );
				filter.connect( gainNode );
				gainNode.connect( this.audioCtx.destination );

				noise.start( now );
				noise.stop( now + duration );
			} catch ( e ) {
				// Silencia qualquer restrição de autoplay de áudio do navegador
			}
		}

		toggle() {
			this.enabled = ! this.enabled;
			return this.enabled;
		}
	}

	class Luiz0067Flipbook {
		constructor( container ) {
			this.container = container;
			this.viewport = container.querySelector( '.luiz0067-flipbook-viewport' );
			this.stage = container.querySelector( '.luiz0067-flipbook-stage' );
			this.loader = container.querySelector( '.luiz0067-flipbook-loader' );
			this.loaderText = container.querySelector( '.luiz0067-loader-text' );
			this.errorBox = container.querySelector( '.luiz0067-flipbook-error' );
			this.errorMsg = container.querySelector( '.luiz0067-error-msg' );

			// Elementos da barra de ferramentas
			this.btnPrev = container.querySelector( '.luiz0067-btn-prev' );
			this.btnNext = container.querySelector( '.luiz0067-btn-next' );
			this.inputPage = container.querySelector( '.luiz0067-input-page' );
			this.totalPagesEl = container.querySelector( '.luiz0067-total-pages' );
			this.btnZoomIn = container.querySelector( '.luiz0067-btn-zoom-in' );
			this.btnZoomOut = container.querySelector( '.luiz0067-btn-zoom-out' );
			this.btnZoomReset = container.querySelector( '.luiz0067-btn-zoom-reset' );
			this.btnSound = container.querySelector( '.luiz0067-btn-sound' );
			this.btnFullscreen = container.querySelector( '.luiz0067-btn-fullscreen' );

			// Atributos de dados
			this.sourceType = container.dataset.sourceType || 'pdf';
			this.pdfUrl = container.dataset.pdfUrl || '';
			this.pageImages = [];
			try {
				this.pageImages = JSON.parse( container.dataset.pageImages || '[]' );
			} catch ( e ) {
				this.pageImages = [];
			}
			this.displayModeConfig = container.dataset.displayMode || 'double-page';
			this.autoSingleMobile = container.dataset.autoSingleMobile === 'true';
			this.enableSound = container.dataset.enableSound === 'true';
			this.startPage = parseInt( container.dataset.startPage || '1', 10 );
			this.themeColor = container.dataset.themeColor || '#0d6efd';

			// Estados internos
			this.totalPages = 0;
			this.currentPage = 1;
			this.isTurning = false;
			this.zoomLevel = 1;
			this.sound = new PaperSoundSynthesizer();
			this.sound.enabled = this.enableSound;
			this.pdfDoc = null;
			this.renderedCanvases = new Map();
			this.effectiveDisplayMode = this.getEffectiveDisplayMode();

			this.init();
		}

		getEffectiveDisplayMode() {
			if ( this.autoSingleMobile && window.innerWidth < 768 ) {
				return 'single-page';
			}
			return this.displayModeConfig;
		}

		async init() {
			this.bindEvents();
			await this.loadDocument();
		}

		bindEvents() {
			// Navegação por botões
			if ( this.btnPrev ) {
				this.btnPrev.addEventListener( 'click', () => this.flipPrev() );
			}
			if ( this.btnNext ) {
				this.btnNext.addEventListener( 'click', () => this.flipNext() );
			}

			// Salto direto por input de página
			if ( this.inputPage ) {
				this.inputPage.addEventListener( 'change', ( e ) => {
					let val = parseInt( e.target.value, 10 );
					if ( isNaN( val ) ) {
						val = 1;
					}
					this.goToPage( Math.max( 1, Math.min( this.totalPages, val ) ) );
				} );
			}

			// Zoom
			if ( this.btnZoomIn ) {
				this.btnZoomIn.addEventListener( 'click', () => this.setZoom( this.zoomLevel + 0.25 ) );
			}
			if ( this.btnZoomOut ) {
				this.btnZoomOut.addEventListener( 'click', () => this.setZoom( this.zoomLevel - 0.25 ) );
			}
			if ( this.btnZoomReset ) {
				this.btnZoomReset.addEventListener( 'click', () => this.setZoom( 1 ) );
			}

			// Som
			if ( this.btnSound ) {
				this.btnSound.addEventListener( 'click', () => {
					const active = this.sound.toggle();
					const icon = this.btnSound.querySelector( 'i' );
					if ( icon ) {
						if ( active ) {
							icon.className = 'fa-solid fa-volume-high text-info';
							this.btnSound.classList.add( 'active' );
						} else {
							icon.className = 'fa-solid fa-volume-xmark text-secondary';
							this.btnSound.classList.remove( 'active' );
						}
					}
				} );
			}

			// Tela cheia
			if ( this.btnFullscreen ) {
				this.btnFullscreen.addEventListener( 'click', () => this.toggleFullscreen() );
			}

			// Teclado
			window.addEventListener( 'keydown', ( e ) => {
				// Somente aciona se o bloco estiver visível na janela
				const rect = this.container.getBoundingClientRect();
				const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
				if ( ! isVisible ) {
					return;
				}

				if ( e.key === 'ArrowRight' || e.key === 'PageDown' ) {
					this.flipNext();
				} else if ( e.key === 'ArrowLeft' || e.key === 'PageUp' ) {
					this.flipPrev();
				}
			} );

			// Responsividade ao redimensionar
			let resizeTimer;
			window.addEventListener( 'resize', () => {
				clearTimeout( resizeTimer );
				resizeTimer = setTimeout( () => {
					const newMode = this.getEffectiveDisplayMode();
					if ( newMode !== this.effectiveDisplayMode ) {
						this.effectiveDisplayMode = newMode;
						this.renderCurrentSpread();
					}
				}, 200 );
			} );

			// Mudança de estado Fullscreen
			document.addEventListener( 'fullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'webkitfullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'mozfullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'MSFullscreenChange', () => this.updateFullscreenButton() );
		}

		async loadDocument() {
			try {
				if ( this.sourceType === 'images' && this.pageImages.length > 0 ) {
					this.totalPages = this.pageImages.length;
					this.finishLoading();
					return;
				}

				if ( ! this.pdfUrl ) {
					this.showError( 'Nenhum arquivo PDF configurado para este flipbook.' );
					return;
				}

				// Aguarda a disponibilidade do PDF.js
				if ( typeof window.pdfjsLib === 'undefined' ) {
					await this.waitForPdfJs();
				}

				if ( typeof window.pdfjsLib === 'undefined' ) {
					throw new Error( 'Biblioteca PDF.js não pôde ser carregada.' );
				}

				const workerUrl = ( window.luiz0067FlipbookConfig && window.luiz0067FlipbookConfig.pdfWorkerUrl ) ||
					'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
				window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

				if ( this.loaderText ) {
					this.loaderText.textContent = 'Baixando PDF...';
				}

				const loadingTask = window.pdfjsLib.getDocument( {
					url: this.pdfUrl,
					withCredentials: false,
				} );

				loadingTask.onProgress = ( progress ) => {
					if ( progress.total > 0 && this.loaderText ) {
						const pct = Math.round( ( progress.loaded / progress.total ) * 100 );
						this.loaderText.textContent = `Carregando: ${ pct }%`;
					}
				};

				this.pdfDoc = await loadingTask.promise;
				this.totalPages = this.pdfDoc.numPages;
				this.finishLoading();
			} catch ( err ) {
				console.error( 'Erro ao inicializar PDF Flipbook:', err );
				this.showError( 'Não foi possível carregar o PDF. Verifique a URL do arquivo ou a configuração de CORS.' );
			}
		}

		waitForPdfJs( maxRetries = 30 ) {
			return new Promise( ( resolve ) => {
				let retries = 0;
				const check = () => {
					if ( typeof window.pdfjsLib !== 'undefined' || retries >= maxRetries ) {
						resolve();
					} else {
						retries++;
						setTimeout( check, 150 );
					}
				};
				check();
			} );
		}

		finishLoading() {
			if ( this.loader ) {
				this.loader.classList.add( 'd-none' );
			}
			if ( this.totalPagesEl ) {
				this.totalPagesEl.textContent = this.totalPages;
			}
			if ( this.inputPage ) {
				this.inputPage.max = this.totalPages;
			}

			const initial = Math.max( 1, Math.min( this.totalPages, this.startPage ) );
			this.goToPage( initial, false );
		}

		showError( message ) {
			if ( this.loader ) {
				this.loader.classList.add( 'd-none' );
			}
			if ( this.errorBox ) {
				this.errorBox.classList.remove( 'd-none' );
				if ( this.errorMsg ) {
					this.errorMsg.textContent = message;
				}
			}
		}

		async getPageElement( pageNum ) {
			if ( pageNum < 1 || pageNum > this.totalPages ) {
				return null;
			}

			const pageWrapper = document.createElement( 'div' );
			pageWrapper.className = 'luiz0067-page-sheet';

			if ( this.sourceType === 'images' ) {
				const imgUrl = this.pageImages[ pageNum - 1 ];
				const img = document.createElement( 'img' );
				img.src = imgUrl;
				img.alt = `Página ${ pageNum }`;
				img.className = 'luiz0067-page-img';
				pageWrapper.appendChild( img );
				return pageWrapper;
			}

			if ( this.pdfDoc ) {
				const canvas = document.createElement( 'canvas' );
				canvas.className = 'luiz0067-page-canvas';
				pageWrapper.appendChild( canvas );

				// Renderiza a página no canvas em alta resolução
				try {
					const page = await this.pdfDoc.getPage( pageNum );
					const baseViewport = page.getViewport( { scale: 1 } );

					// Calcula escala para caber na altura disponível
					const stageHeight = this.viewport.clientHeight ? this.viewport.clientHeight - 40 : 600;
					const scale = ( stageHeight / baseViewport.height ) * ( window.devicePixelRatio || 1 );
					const scaledViewport = page.getViewport( { scale } );

					canvas.height = scaledViewport.height;
					canvas.width = scaledViewport.width;
					canvas.style.height = '100%';
					canvas.style.width = 'auto';

					const renderContext = {
						canvasContext: canvas.getContext( '2d' ),
						viewport: scaledViewport,
					};
					await page.render( renderContext ).promise;
				} catch ( err ) {
					console.warn( `Erro renderizando página ${ pageNum }:`, err );
				}
				return pageWrapper;
			}

			return null;
		}

		async renderCurrentSpread( animationDirection = null ) {
			if ( ! this.stage ) {
				return;
			}

			this.stage.innerHTML = '';
			const bookEl = document.createElement( 'div' );
			bookEl.className = `luiz0067-3d-book ${ this.effectiveDisplayMode }`;

			// Aplica Zoom
			bookEl.style.transform = `scale(${ this.zoomLevel })`;

			if ( this.effectiveDisplayMode === 'double-page' ) {
				// Primeira página (capa) ou última página em modo 2 páginas
				let leftPageNum = null;
				let rightPageNum = null;

				if ( this.currentPage === 1 ) {
					rightPageNum = 1;
				} else {
					leftPageNum = this.currentPage % 2 === 0 ? this.currentPage : this.currentPage - 1;
					rightPageNum = leftPageNum + 1 <= this.totalPages ? leftPageNum + 1 : null;
				}

				// Lado Esquerdo
				const leftLeaf = document.createElement( 'div' );
				leftLeaf.className = 'luiz0067-leaf leaf-left';
				if ( leftPageNum ) {
					const leftContent = await this.getPageElement( leftPageNum );
					if ( leftContent ) {
						leftLeaf.appendChild( leftContent );
					}
					leftLeaf.addEventListener( 'click', () => this.flipPrev() );
				} else {
					leftLeaf.classList.add( 'leaf-empty' );
				}
				bookEl.appendChild( leftLeaf );

				// Lombada Central com gradiente de sombra 3D
				const spine = document.createElement( 'div' );
				spine.className = 'luiz0067-spine';
				bookEl.appendChild( spine );

				// Lado Direito
				const rightLeaf = document.createElement( 'div' );
				rightLeaf.className = 'luiz0067-leaf leaf-right';
				if ( rightPageNum ) {
					const rightContent = await this.getPageElement( rightPageNum );
					if ( rightContent ) {
						rightLeaf.appendChild( rightContent );
					}
					rightLeaf.addEventListener( 'click', () => this.flipNext() );
				} else {
					rightLeaf.classList.add( 'leaf-empty' );
				}
				bookEl.appendChild( rightLeaf );

				// Animação 3D de Virar Página
				if ( animationDirection === 'next' ) {
					rightLeaf.classList.add( 'flip-anim-next' );
					this.sound.play();
				} else if ( animationDirection === 'prev' ) {
					leftLeaf.classList.add( 'flip-anim-prev' );
					this.sound.play();
				}
			} else {
				// Modo Página Única
				const singleLeaf = document.createElement( 'div' );
				singleLeaf.className = 'luiz0067-leaf leaf-single shadow-lg';
				const content = await this.getPageElement( this.currentPage );
				if ( content ) {
					singleLeaf.appendChild( content );
				}
				singleLeaf.addEventListener( 'click', ( e ) => {
					const rect = singleLeaf.getBoundingClientRect();
					const clickX = e.clientX - rect.left;
					if ( clickX > rect.width / 2 ) {
						this.flipNext();
					} else {
						this.flipPrev();
					}
				} );
				bookEl.appendChild( singleLeaf );

				if ( animationDirection === 'next' ) {
					singleLeaf.classList.add( 'flip-anim-single-next' );
					this.sound.play();
				} else if ( animationDirection === 'prev' ) {
					singleLeaf.classList.add( 'flip-anim-single-prev' );
					this.sound.play();
				}
			}

			this.stage.appendChild( bookEl );
			this.updateControls();
		}

		updateControls() {
			if ( this.inputPage ) {
				this.inputPage.value = this.currentPage;
			}
			if ( this.btnPrev ) {
				this.btnPrev.disabled = this.currentPage <= 1;
			}
			if ( this.btnNext ) {
				this.btnNext.disabled = this.currentPage >= this.totalPages;
			}
		}

		flipNext() {
			if ( this.isTurning || this.currentPage >= this.totalPages ) {
				return;
			}

			this.isTurning = true;
			const step = this.effectiveDisplayMode === 'double-page' ? ( this.currentPage === 1 ? 1 : 2 ) : 1;
			this.currentPage = Math.min( this.totalPages, this.currentPage + step );

			this.renderCurrentSpread( 'next' );
			setTimeout( () => {
				this.isTurning = false;
			}, 500 );
		}

		flipPrev() {
			if ( this.isTurning || this.currentPage <= 1 ) {
				return;
			}

			this.isTurning = true;
			const step = this.effectiveDisplayMode === 'double-page' ? ( this.currentPage === 2 ? 1 : 2 ) : 1;
			this.currentPage = Math.max( 1, this.currentPage - step );

			this.renderCurrentSpread( 'prev' );
			setTimeout( () => {
				this.isTurning = false;
			}, 500 );
		}

		goToPage( pageNum, animate = true ) {
			if ( pageNum < 1 || pageNum > this.totalPages ) {
				return;
			}
			const dir = pageNum > this.currentPage ? 'next' : 'prev';
			this.currentPage = pageNum;
			this.renderCurrentSpread( animate ? dir : null );
		}

		setZoom( level ) {
			this.zoomLevel = Math.max( 0.75, Math.min( 2.5, level ) );
			const bookEl = this.stage.querySelector( '.luiz0067-3d-book' );
			if ( bookEl ) {
				bookEl.style.transform = `scale(${ this.zoomLevel })`;
			}
		}

		toggleFullscreen() {
			if ( ! document.fullscreenElement && ! document.webkitFullscreenElement && ! document.mozFullScreenElement && ! document.msFullscreenElement ) {
				if ( this.container.requestFullscreen ) {
					this.container.requestFullscreen();
				} else if ( this.container.webkitRequestFullscreen ) {
					this.container.webkitRequestFullscreen();
				} else if ( this.container.mozRequestFullScreen ) {
					this.container.mozRequestFullScreen();
				} else if ( this.container.msRequestFullscreen ) {
					this.container.msRequestFullscreen();
				}
			} else {
				if ( document.exitFullscreen ) {
					document.exitFullscreen();
				} else if ( document.webkitExitFullscreen ) {
					document.webkitExitFullscreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.msExitFullscreen ) {
					document.msExitFullscreen();
				}
			}
		}

		updateFullscreenButton() {
			const isFs = !! ( document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement );
			if ( this.btnFullscreen ) {
				const icon = this.btnFullscreen.querySelector( 'i' );
				if ( icon ) {
					icon.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
				}
			}
		}
	}

	// Inicialização no DOM
	function initFlipbooks() {
		const containers = document.querySelectorAll( '[data-luiz0067-flipbook="true"]' );
		containers.forEach( ( container ) => {
			if ( ! container.dataset.flipbookInitialized ) {
				container.dataset.flipbookInitialized = 'true';
				new Luiz0067Flipbook( container );
			}
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initFlipbooks );
	} else {
		initFlipbooks();
	}
} )();
