/**
 * Luiz0067 PDF Flipbook - Frontend View Script
 * Motor responsivo de visualização 3D baseado no Turn.js & PDF.js
 * Inspirado no catálogo interativo de luiz0067yahoo.github.io/luiz0067yahoo/
 * Autor: Luiz Fernando Brogliatto Ferreira
 */

( function ( $ ) {
	'use strict';

	// Sintetizador acústico de folha de papel via Web Audio API nativo
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
				const duration = 0.18;

				const bufferSize = this.audioCtx.sampleRate * duration;
				const buffer = this.audioCtx.createBuffer( 1, bufferSize, this.audioCtx.sampleRate );
				const data = buffer.getChannelData( 0 );
				for ( let i = 0; i < bufferSize; i++ ) {
					data[ i ] = ( Math.random() * 2 - 1 ) * Math.exp( -i / ( bufferSize * 0.45 ) );
				}

				const noise = this.audioCtx.createBufferSource();
				noise.buffer = buffer;

				const filter = this.audioCtx.createBiquadFilter();
				filter.type = 'bandpass';
				filter.frequency.setValueAtTime( 1200, now );
				filter.frequency.exponentialRampToValueAtTime( 2800, now + duration * 0.5 );
				filter.frequency.exponentialRampToValueAtTime( 900, now + duration );
				filter.Q.setValueAtTime( 3.0, now );

				const gainNode = this.audioCtx.createGain();
				gainNode.gain.setValueAtTime( 0.25, now );
				gainNode.gain.exponentialRampToValueAtTime( 0.001, now + duration );

				noise.connect( filter );
				filter.connect( gainNode );
				gainNode.connect( this.audioCtx.destination );

				noise.start( now );
				noise.stop( now + duration );
			} catch ( e ) {
				// Silencia restrições de autoplay
			}
		}

		toggle() {
			this.enabled = ! this.enabled;
			return this.enabled;
		}
	}

	class Luiz0067TurnFlipbook {
		constructor( container ) {
			this.container = container;
			this.$container = $( container );
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
			this.enableAutoplay = container.dataset.enableAutoplay === 'true';
			this.autoplayInterval = parseInt( container.dataset.autoplayInterval || '5', 10 ) * 1000;
			this.startPage = parseInt( container.dataset.startPage || '1', 10 );
			this.themeColor = container.dataset.themeColor || '#0d6efd';

			// Estados internos
			this.totalPages = 0;
			this.currentPage = 1;
			this.zoomLevel = 1;
			this.sound = new PaperSoundSynthesizer();
			this.sound.enabled = this.enableSound;
			this.pdfDoc = null;
			this.pageAspectRatio = 0.75;
			this.$book = null;
			this.autoplayActive = this.enableAutoplay;
			this.autoplayTimer = null;
			this.autoplayForward = true;
			this.autoplayCount = 1;

			this.init();
		}

		async init() {
			this.bindEvents();
			await this.loadDocument();
		}

		bindEvents() {
			// Navegação por botões
			if ( this.btnPrev ) {
				this.btnPrev.addEventListener( 'click', () => {
					this.stopAutoplay();
					if ( this.$book && $.fn.turn ) {
						this.$book.turn( 'previous' );
					}
				} );
			}
			if ( this.btnNext ) {
				this.btnNext.addEventListener( 'click', () => {
					this.stopAutoplay();
					if ( this.$book && $.fn.turn ) {
						this.$book.turn( 'next' );
					}
				} );
			}

			// Salto direto por input de página
			if ( this.inputPage ) {
				this.inputPage.addEventListener( 'change', ( e ) => {
					this.stopAutoplay();
					let val = parseInt( e.target.value, 10 );
					if ( isNaN( val ) ) {
						val = 1;
					}
					const targetPage = Math.max( 1, Math.min( this.totalPages, val ) );
					if ( this.$book && $.fn.turn ) {
						this.$book.turn( 'page', targetPage );
					}
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
				const rect = this.container.getBoundingClientRect();
				const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
				if ( ! isVisible ) {
					return;
				}

				if ( e.key === 'ArrowRight' || e.key === 'PageDown' ) {
					this.stopAutoplay();
					if ( this.$book && $.fn.turn ) {
						this.$book.turn( 'next' );
					}
				} else if ( e.key === 'ArrowLeft' || e.key === 'PageUp' ) {
					this.stopAutoplay();
					if ( this.$book && $.fn.turn ) {
						this.$book.turn( 'previous' );
					}
				}
			} );

			// Responsividade ao redimensionar
			let resizeTimer;
			window.addEventListener( 'resize', () => {
				clearTimeout( resizeTimer );
				resizeTimer = setTimeout( () => {
					this.resizeFlipbook();
				}, 250 );
			} );

			// Fullscreen events
			document.addEventListener( 'fullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'webkitfullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'mozfullscreenchange', () => this.updateFullscreenButton() );
			document.addEventListener( 'MSFullscreenChange', () => this.updateFullscreenButton() );
		}

		async loadDocument() {
			try {
				if ( this.sourceType === 'images' && this.pageImages.length > 0 ) {
					this.totalPages = this.pageImages.length;
					await this.buildFlipbookStructure();
					return;
				}

				if ( ! this.pdfUrl ) {
					this.showError( 'Nenhum arquivo PDF configurado para este flipbook.' );
					return;
				}

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

				// Determina a proporção da primeira página
				const firstPage = await this.pdfDoc.getPage( 1 );
				const viewport = firstPage.getViewport( { scale: 1 } );
				this.pageAspectRatio = viewport.width / viewport.height;

				await this.buildFlipbookStructure();
			} catch ( err ) {
				console.error( 'Erro ao inicializar PDF Flipbook:', err );
				this.showError( 'Não foi possível carregar o PDF. Verifique a URL do arquivo ou configure o CORS do servidor.' );
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

		getDimensions() {
			const stageWidth = this.viewport.clientWidth || 900;
			const stageHeight = this.viewport.clientHeight ? this.viewport.clientHeight - 40 : 560;

			const isMobile = this.autoSingleMobile && window.innerWidth < 768;
			const displayMode = isMobile ? 'single' : ( this.displayModeConfig === 'single-page' ? 'single' : 'double' );

			let bookHeight = stageHeight;
			let singlePageWidth = bookHeight * this.pageAspectRatio;
			let bookWidth = displayMode === 'double' ? singlePageWidth * 2 : singlePageWidth;

			// Ajusta caso a largura calculada exceda a área disponível
			const maxAllowedWidth = stageWidth - 30;
			if ( bookWidth > maxAllowedWidth ) {
				bookWidth = maxAllowedWidth;
				singlePageWidth = displayMode === 'double' ? bookWidth / 2 : bookWidth;
				bookHeight = singlePageWidth / this.pageAspectRatio;
			}

			return {
				width: Math.round( bookWidth ),
				height: Math.round( bookHeight ),
				display: displayMode,
			};
		}

		async buildFlipbookStructure() {
			if ( this.loader ) {
				this.loader.classList.add( 'd-none' );
			}
			if ( this.totalPagesEl ) {
				this.totalPagesEl.textContent = this.totalPages;
			}
			if ( this.inputPage ) {
				this.inputPage.max = this.totalPages;
			}

			this.stage.innerHTML = '';

			// Elemento magazine do Turn.js
			const magazine = document.createElement( 'div' );
			magazine.className = 'luiz0067-magazine';
			this.stage.appendChild( magazine );

			const dims = this.getDimensions();

			// Cria as páginas
			for ( let p = 1; p <= this.totalPages; p++ ) {
				const pageDiv = document.createElement( 'div' );
				pageDiv.className = `page p${ p } ${ p % 2 === 0 ? 'even' : 'odd' }`;
				pageDiv.dataset.page = p;

				if ( this.sourceType === 'images' ) {
					const img = document.createElement( 'img' );
					img.src = this.pageImages[ p - 1 ];
					img.alt = `Página ${ p }`;
					pageDiv.appendChild( img );
				} else {
					const canvas = document.createElement( 'canvas' );
					canvas.className = 'luiz0067-page-canvas';
					pageDiv.appendChild( canvas );
				}

				magazine.appendChild( pageDiv );
			}

			this.$book = $( magazine );

			// Inicializa Turn.js
			if ( typeof $.fn.turn === 'function' ) {
				this.$book.turn( {
					width: dims.width,
					height: dims.height,
					display: dims.display,
					autoCenter: true,
					elevation: 50,
					gradients: true,
					duration: 700,
					page: Math.max( 1, Math.min( this.totalPages, this.startPage ) ),
					when: {
						turning: ( event, page ) => {
							this.currentPage = page;
							this.sound.play();
							this.updateControls( page );
							this.renderPdfPagesAround( page );
						},
						turned: ( event, page ) => {
							this.currentPage = page;
							this.updateControls( page );
							this.renderPdfPagesAround( page );
						},
					},
				} );

				// Clique no livro interrompe autoplay
				this.$book.on( 'click', () => {
					this.stopAutoplay();
				} );
			}

			// Renderiza páginas iniciais
			await this.renderPdfPagesAround( this.startPage || 1 );

			this.updateControls( this.startPage || 1 );

			// Inicia autoplay se configurado
			if ( this.enableAutoplay ) {
				this.startAutoplay();
			}
		}

		async renderPdfPage( pageNum ) {
			if ( ! this.pdfDoc || pageNum < 1 || pageNum > this.totalPages ) {
				return;
			}

			const pageDiv = this.stage.querySelector( `.page.p${ pageNum }` );
			if ( ! pageDiv ) {
				return;
			}

			const canvas = pageDiv.querySelector( 'canvas' );
			if ( ! canvas || canvas.dataset.rendered === 'true' ) {
				return;
			}

			try {
				canvas.dataset.rendered = 'true';
				const page = await this.pdfDoc.getPage( pageNum );
				const dims = this.getDimensions();
				const singlePageWidth = dims.display === 'double' ? dims.width / 2 : dims.width;

				const baseVp = page.getViewport( { scale: 1 } );
				const scale = ( singlePageWidth / baseVp.width ) * ( window.devicePixelRatio || 1 );
				const scaledVp = page.getViewport( { scale } );

				canvas.width = scaledVp.width;
				canvas.height = scaledVp.height;
				canvas.style.width = '100%';
				canvas.style.height = '100%';

				const renderContext = {
					canvasContext: canvas.getContext( '2d' ),
					viewport: scaledVp,
				};
				await page.render( renderContext ).promise;
			} catch ( err ) {
				console.warn( `Erro renderizando página PDF ${ pageNum }:`, err );
			}
		}

		async renderPdfPagesAround( centerPage ) {
			if ( this.sourceType === 'images' || ! this.pdfDoc ) {
				return;
			}

			const pagesToRender = [
				centerPage - 1,
				centerPage,
				centerPage + 1,
				centerPage + 2,
			];

			for ( const p of pagesToRender ) {
				if ( p >= 1 && p <= this.totalPages ) {
					await this.renderPdfPage( p );
				}
			}
		}

		updateControls( page ) {
			this.currentPage = page;
			if ( this.inputPage ) {
				this.inputPage.value = page;
			}
			if ( this.btnPrev ) {
				this.btnPrev.disabled = page <= 1;
			}
			if ( this.btnNext ) {
				this.btnNext.disabled = page >= this.totalPages;
			}
		}

		resizeFlipbook() {
			if ( ! this.$book || typeof this.$book.turn !== 'function' ) {
				return;
			}

			const dims = this.getDimensions();
			this.$book.turn( 'display', dims.display );
			this.$book.turn( 'size', dims.width, dims.height );
			this.renderPdfPagesAround( this.currentPage );
		}

		setZoom( level ) {
			this.zoomLevel = Math.max( 0.75, Math.min( 2.5, level ) );
			if ( this.$book ) {
				this.$book.css( {
					transform: `scale(${ this.zoomLevel })`,
					transformOrigin: 'center center',
					transition: 'transform 0.25s ease',
				} );
			}
		}

		startAutoplay() {
			if ( ! this.autoplayActive ) {
				return;
			}

			clearTimeout( this.autoplayTimer );
			this.autoplayTimer = setTimeout( () => {
				if ( ! this.autoplayActive || ! this.$book || typeof this.$book.turn !== 'function' ) {
					return;
				}

				if ( this.autoplayForward ) {
					if ( this.currentPage >= this.totalPages ) {
						this.autoplayForward = false;
						this.$book.turn( 'previous' );
					} else {
						this.$book.turn( 'next' );
					}
				} else {
					if ( this.currentPage <= 1 ) {
						this.autoplayForward = true;
						this.$book.turn( 'next' );
					} else {
						this.$book.turn( 'previous' );
					}
				}

				this.startAutoplay();
			}, this.autoplayInterval );
		}

		stopAutoplay() {
			this.autoplayActive = false;
			clearTimeout( this.autoplayTimer );
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
			setTimeout( () => this.resizeFlipbook(), 300 );
		}
	}

	function initAllFlipbooks() {
		const containers = document.querySelectorAll( '[data-luiz0067-flipbook="true"]' );
		containers.forEach( ( el ) => {
			if ( ! el.dataset.flipbookInitialized ) {
				el.dataset.flipbookInitialized = 'true';
				new Luiz0067TurnFlipbook( el );
			}
		} );
	}

	if ( typeof $ !== 'undefined' ) {
		$( document ).ready( initAllFlipbooks );
	} else if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAllFlipbooks );
	} else {
		initAllFlipbooks();
	}
} )( window.jQuery || window.$ );
