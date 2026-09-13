import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		sourceType,
		pdfUrl,
		pdfTitle,
		pageImages,
		bookHeight,
		displayMode,
		autoSinglePageOnMobile,
		enableDownload,
		enableFullscreen,
		enableSound,
		enableZoom,
		themeColor,
		backgroundColor,
		startPage,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'luiz0067-pdf-flipbook-block',
	} );

	return (
		<div { ...blockProps }>
			<div
				className="luiz0067-flipbook-container card shadow-lg border-0"
				data-luiz0067-flipbook="true"
				data-source-type={ sourceType }
				data-pdf-url={ pdfUrl }
				data-pdf-title={ pdfTitle }
				data-page-images={ JSON.stringify( pageImages || [] ) }
				data-book-height={ bookHeight || '650px' }
				data-display-mode={ displayMode || 'double-page' }
				data-auto-single-mobile={ autoSinglePageOnMobile ? 'true' : 'false' }
				data-enable-download={ enableDownload ? 'true' : 'false' }
				data-enable-fullscreen={ enableFullscreen ? 'true' : 'false' }
				data-enable-sound={ enableSound ? 'true' : 'false' }
				data-enable-zoom={ enableZoom ? 'true' : 'false' }
				data-theme-color={ themeColor || '#0d6efd' }
				data-background-color={ backgroundColor || '#1e293b' }
				data-start-page={ startPage || 1 }
			>
				{ /* Palco e visualizador 3D do Flipbook */ }
				<div
					className="luiz0067-flipbook-viewport position-relative overflow-hidden"
					style={ { height: bookHeight || '650px', backgroundColor: backgroundColor || '#1e293b' } }
				>
					{ /* Carregador / Spinner inicial Bootstrap 5 */ }
					<div className="luiz0067-flipbook-loader position-absolute top-50 start-50 translate-middle text-center text-white">
						<div
							className="spinner-border mb-3"
							role="status"
							style={ { width: '3rem', height: '3rem', color: themeColor || '#0d6efd' } }
						>
							<span className="visually-hidden">Carregando documento...</span>
						</div>
						<div className="fw-semibold small luiz0067-loader-text">
							Carregando páginas...
						</div>
					</div>

					{ /* Contêiner onde o motor 3D Flipbook renderiza as folhas */ }
					<div className="luiz0067-flipbook-stage h-100 w-100 d-flex align-items-center justify-content-center"></div>

					{ /* Mensagem de alerta caso o documento não seja encontrado */ }
					<div className="luiz0067-flipbook-error position-absolute top-50 start-50 translate-middle text-center text-white d-none p-4 rounded bg-dark bg-opacity-75 border border-danger">
						<i className="fa-solid fa-triangle-exclamation fa-2x text-danger mb-2"></i>
						<p className="small mb-0 luiz0067-error-msg">Não foi possível carregar o arquivo PDF.</p>
					</div>
				</div>

				{ /* Barra de ferramentas inferior com componentes Bootstrap 5 e Font Awesome 6 */ }
				<div
					className="luiz0067-flipbook-toolbar card-footer bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2 border-0"
					style={ { borderTop: `2px solid ${ themeColor || '#0d6efd' }` } }
				>
					{ /* Navegação de Páginas */ }
					<div className="d-flex align-items-center gap-2">
						<button
							type="button"
							className="btn btn-sm btn-outline-light luiz0067-btn-prev d-flex align-items-center justify-content-center"
							aria-label="Página Anterior"
							title="Página Anterior"
							style={ { minWidth: '34px', height: '34px' } }
						>
							<i className="fa-solid fa-chevron-left"></i>
						</button>

						<div className="luiz0067-page-indicator d-flex align-items-center text-white small px-2">
							<span className="d-none d-sm-inline me-1">Página</span>
							<input
								type="number"
								className="form-control form-control-sm bg-dark text-white border-secondary text-center luiz0067-input-page"
								min="1"
								defaultValue={ startPage || 1 }
								style={ { width: '52px', height: '28px', padding: '2px 4px' } }
								aria-label="Número da Página"
							/>
							<span className="mx-1">de</span>
							<span className="fw-bold luiz0067-total-pages">--</span>
						</div>

						<button
							type="button"
							className="btn btn-sm btn-outline-light luiz0067-btn-next d-flex align-items-center justify-content-center"
							aria-label="Próxima Página"
							title="Próxima Página"
							style={ { minWidth: '34px', height: '34px' } }
						>
							<i className="fa-solid fa-chevron-right"></i>
						</button>
					</div>

					{ /* Controles de Visualização, Som, Tela Cheia e Download */ }
					<div className="d-flex align-items-center gap-2">
						{ enableZoom && (
							<div className="btn-group btn-group-sm">
								<button
									type="button"
									className="btn btn-outline-light luiz0067-btn-zoom-out"
									aria-label="Diminuir Zoom"
									title="Diminuir Zoom"
								>
									<i className="fa-solid fa-magnifying-glass-minus"></i>
								</button>
								<button
									type="button"
									className="btn btn-outline-light luiz0067-btn-zoom-reset d-none d-md-inline-block"
									aria-label="Reiniciar Zoom"
									title="Reiniciar Zoom (100%)"
								>
									<i className="fa-solid fa-arrows-rotate"></i>
								</button>
								<button
									type="button"
									className="btn btn-outline-light luiz0067-btn-zoom-in"
									aria-label="Aumentar Zoom"
									title="Aumentar Zoom"
								>
									<i className="fa-solid fa-magnifying-glass-plus"></i>
								</button>
							</div>
						) }

						{ enableSound && (
							<button
								type="button"
								className="btn btn-sm btn-outline-light luiz0067-btn-sound active"
								aria-label="Ativar/Desativar Som"
								title="Efeito Sonoro de Folhear Papel"
								style={ { minWidth: '34px', height: '34px' } }
							>
								<i className="fa-solid fa-volume-high text-info"></i>
							</button>
						) }

						{ enableFullscreen && (
							<button
								type="button"
								className="btn btn-sm btn-outline-light luiz0067-btn-fullscreen"
								aria-label="Tela Cheia"
								title="Alternar Tela Cheia"
								style={ { minWidth: '34px', height: '34px' } }
							>
								<i className="fa-solid fa-expand"></i>
							</button>
						) }

						{ enableDownload && pdfUrl && (
							<a
								href={ pdfUrl }
								download
								target="_blank"
								rel="noopener noreferrer"
								className="btn btn-sm text-white luiz0067-btn-download d-flex align-items-center gap-1 shadow-sm px-3"
								style={ { backgroundColor: themeColor || '#0d6efd', borderColor: themeColor || '#0d6efd' } }
								title="Baixar Arquivo PDF Original"
							>
								<i className="fa-solid fa-download"></i>
								<span className="d-none d-md-inline">Download</span>
							</a>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}
