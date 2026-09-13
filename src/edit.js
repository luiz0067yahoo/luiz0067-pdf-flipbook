import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	SelectControl,
	ToggleControl,
	TextControl,
	RangeControl,
	TabPanel,
	ColorPalette,
	Notice,
	ButtonGroup,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

const PRESET_HEIGHTS = [
	{ label: '500px', value: '500px' },
	{ label: '650px (Padrão)', value: '650px' },
	{ label: '750px', value: '750px' },
	{ label: '850px', value: '850px' },
];

const PRESET_THEME_COLORS = [
	{ name: 'Azul Bootstrap', color: '#0d6efd' },
	{ name: 'Índigo Moderno', color: '#6610f2' },
	{ name: 'Roxo Premium', color: '#6f42c1' },
	{ name: 'Vermelho Vibrante', color: '#dc3545' },
	{ name: 'Laranja / Âmbar', color: '#fd7e14' },
	{ name: 'Verde Esmeralda', color: '#198754' },
	{ name: 'Azul Petróleo / Teal', color: '#20c997' },
	{ name: 'Ciano Tecnológico', color: '#0dcaf0' },
	{ name: 'Preto Grafite', color: '#212529' },
];

const PRESET_BG_COLORS = [
	{ name: 'Ardósia Escura (Padrão)', color: '#1e293b' },
	{ name: 'Preto Profundo', color: '#0f172a' },
	{ name: 'Grafite Carvão', color: '#18181b' },
	{ name: 'Azul Marinho Escuro', color: '#172554' },
	{ name: 'Cinza Neutro', color: '#334155' },
	{ name: 'Cinza Suave Claro', color: '#f1f5f9' },
	{ name: 'Branco Puro', color: '#ffffff' },
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		sourceType,
		pdfUrl,
		pdfTitle,
		pdfSize,
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
		enableAutoplay,
		autoplayInterval,
	} = attributes;

	const [ previewPage, setPreviewPage ] = useState( startPage || 1 );

	const blockProps = useBlockProps( {
		className: 'luiz0067-pdf-flipbook-block',
	} );

	// Manipula a seleção do PDF no MediaUpload
	const onSelectPdf = ( media ) => {
		let formattedSize = '';
		if ( media.filesizeInBytes ) {
			const sizeInMB = ( media.filesizeInBytes / ( 1024 * 1024 ) ).toFixed( 2 );
			formattedSize = `${ sizeInMB } MB`;
		} else if ( media.filesizeHumanReadable ) {
			formattedSize = media.filesizeHumanReadable;
		}

		setAttributes( {
			pdfUrl: media.url,
			pdfTitle: media.title || media.filename || __( 'Documento PDF', 'luiz0067-pdf-flipbook' ),
			pdfSize: formattedSize,
		} );
	};

	// Remove o PDF selecionado
	const onRemovePdf = () => {
		setAttributes( {
			pdfUrl: '',
			pdfTitle: '',
			pdfSize: '',
		} );
	};

	// Manipula a seleção de imagens de páginas
	const onSelectImages = ( medias ) => {
		const urls = medias.map( ( m ) => m.url );
		setAttributes( { pageImages: urls } );
	};

	const hasContent = ( sourceType === 'pdf' && pdfUrl ) || ( sourceType === 'images' && pageImages.length > 0 );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<div className="luiz0067-flipbook-inspector-header p-3 border-bottom bg-light">
					<h3 className="m-0 fs-6 fw-bold text-dark d-flex align-items-center gap-2">
						<i className="fa-solid fa-book-open text-primary"></i>
						{ __( 'Configurações do Flipbook', 'luiz0067-pdf-flipbook' ) }
					</h3>
					<small className="text-muted">
						{ __( 'Luiz0067 PDF Flipbook v1.0.0', 'luiz0067-pdf-flipbook' ) }
					</small>
				</div>

				<TabPanel
					className="luiz0067-flipbook-tabs"
					activeClass="active-tab"
					tabs={ [
						{
							name: 'source',
							title: __( 'Arquivo e Origem', 'luiz0067-pdf-flipbook' ),
							className: 'tab-source',
						},
						{
							name: 'layout',
							title: __( 'Dimensões e Layout', 'luiz0067-pdf-flipbook' ),
							className: 'tab-layout',
						},
						{
							name: 'controls',
							title: __( 'Barra e Controles', 'luiz0067-pdf-flipbook' ),
							className: 'tab-controls',
						},
					] }
				>
					{ ( tab ) => {
						if ( tab.name === 'source' ) {
							return (
								<PanelBody title={ __( 'Origem do Documento', 'luiz0067-pdf-flipbook' ) } initialOpen={ true }>
									<SelectControl
										label={ __( 'Tipo de Origem', 'luiz0067-pdf-flipbook' ) }
										value={ sourceType }
										options={ [
											{ label: __( 'Arquivo PDF (Recomendado)', 'luiz0067-pdf-flipbook' ), value: 'pdf' },
											{ label: __( 'Galeria de Imagens de Páginas', 'luiz0067-pdf-flipbook' ), value: 'images' },
										] }
										onChange={ ( value ) => setAttributes( { sourceType: value } ) }
										help={ __( 'Selecione se o flipbook será construído a partir de um PDF único ou de imagens individuais.', 'luiz0067-pdf-flipbook' ) }
									/>

									{ sourceType === 'pdf' && (
										<div className="luiz0067-source-pdf-section mt-3">
											<MediaUploadCheck>
												<MediaUpload
													onSelect={ onSelectPdf }
													allowedTypes={ [ 'application/pdf' ] }
													value={ pdfUrl }
													render={ ( { open } ) => (
														<div className="d-grid gap-2">
															<Button
																variant="primary"
																onClick={ open }
																className="btn-upload-pdf d-flex align-items-center justify-content-center gap-2 py-2"
															>
																<i className="fa-solid fa-file-pdf"></i>
																{ pdfUrl
																	? __( 'Substituir Arquivo PDF', 'luiz0067-pdf-flipbook' )
																	: __( 'Carregar Arquivo PDF', 'luiz0067-pdf-flipbook' ) }
															</Button>
														</div>
													) }
												/>
											</MediaUploadCheck>

											{ pdfUrl ? (
												<div className="card bg-light border p-2 mt-3 shadow-sm rounded">
													<div className="d-flex align-items-start gap-2">
														<i className="fa-solid fa-file-lines fa-2x text-danger mt-1"></i>
														<div className="flex-grow-1 overflow-hidden">
															<strong className="d-block text-truncate text-dark" title={ pdfTitle }>
																{ pdfTitle || __( 'Documento PDF', 'luiz0067-pdf-flipbook' ) }
															</strong>
															{ pdfSize && (
																<small className="text-muted d-block">
																	{ __( 'Tamanho:', 'luiz0067-pdf-flipbook' ) } { pdfSize }
																</small>
															) }
															<small className="text-muted d-block text-truncate" title={ pdfUrl }>
																{ pdfUrl }
															</small>
														</div>
													</div>
													<div className="mt-2 pt-2 border-top d-flex justify-content-end">
														<Button
															isDestructive
															isSmall
															onClick={ onRemovePdf }
															className="d-flex align-items-center gap-1"
														>
															<i className="fa-solid fa-trash-can"></i>
															{ __( 'Remover PDF', 'luiz0067-pdf-flipbook' ) }
														</Button>
													</div>
												</div>
											) : (
												<Notice status="warning" isDismissible={ false } className="mt-2">
													{ __( 'Nenhum PDF selecionado. Carregue um documento para ativar o flipbook.', 'luiz0067-pdf-flipbook' ) }
												</Notice>
											) }
										</div>
									) }

									{ sourceType === 'images' && (
										<div className="luiz0067-source-images-section mt-3">
											<MediaUploadCheck>
												<MediaUpload
													onSelect={ onSelectImages }
													allowedTypes={ [ 'image' ] }
													multiple={ true }
													gallery={ true }
													render={ ( { open } ) => (
														<div className="d-grid gap-2">
															<Button
																variant="secondary"
																onClick={ open }
																className="d-flex align-items-center justify-content-center gap-2 py-2"
															>
																<i className="fa-solid fa-images"></i>
																{ pageImages.length > 0
																	? __( 'Gerenciar Imagens de Páginas', 'luiz0067-pdf-flipbook' )
																	: __( 'Carregar Imagens de Páginas', 'luiz0067-pdf-flipbook' ) }
															</Button>
														</div>
													) }
												/>
											</MediaUploadCheck>

											<small className="text-muted d-block mt-2">
												{ pageImages.length > 0
													? `${ pageImages.length } ${ __( 'páginas carregadas na galeria.', 'luiz0067-pdf-flipbook' ) }`
													: __( 'Nenhuma imagem selecionada ainda.', 'luiz0067-pdf-flipbook' ) }
											</small>
										</div>
									) }
								</PanelBody>
							);
						}

						if ( tab.name === 'layout' ) {
							return (
								<PanelBody title={ __( 'Dimensões e Palco', 'luiz0067-pdf-flipbook' ) } initialOpen={ true }>
									<div className="mb-3">
										<label className="form-label fw-bold d-block mb-1">
											{ __( 'Altura do Flipbook', 'luiz0067-pdf-flipbook' ) }
										</label>
										<ButtonGroup className="d-flex flex-wrap gap-1 mb-2">
											{ PRESET_HEIGHTS.map( ( preset ) => (
												<Button
													key={ preset.value }
													isSmall
													variant={ bookHeight === preset.value ? 'primary' : 'secondary' }
													onClick={ () => setAttributes( { bookHeight: preset.value } ) }
												>
													{ preset.label }
												</Button>
											) ) }
										</ButtonGroup>
										<TextControl
											label={ __( 'Altura Personalizada (CSS)', 'luiz0067-pdf-flipbook' ) }
											value={ bookHeight }
											onChange={ ( value ) => setAttributes( { bookHeight: value } ) }
											help={ __( 'Exemplo: 650px, 700px, 80vh', 'luiz0067-pdf-flipbook' ) }
										/>
									</div>

									<SelectControl
										label={ __( 'Modo de Exibição Inicial', 'luiz0067-pdf-flipbook' ) }
										value={ displayMode }
										options={ [
											{ label: __( 'Página Dupla (Livro Aberto 2 Páginas)', 'luiz0067-pdf-flipbook' ), value: 'double-page' },
											{ label: __( 'Página Única (Folha Individual)', 'luiz0067-pdf-flipbook' ), value: 'single-page' },
										] }
										onChange={ ( value ) => setAttributes( { displayMode: value } ) }
										help={ __( 'No modo página dupla, duas páginas são apresentadas lado a lado como em um livro físico real.', 'luiz0067-pdf-flipbook' ) }
									/>

									<ToggleControl
										label={ __( 'Página Única Automática no Celular', 'luiz0067-pdf-flipbook' ) }
										checked={ autoSinglePageOnMobile }
										onChange={ ( value ) => setAttributes( { autoSinglePageOnMobile: value } ) }
										help={ __( 'Em telas menores (< 768px), o leitor adapta-se automaticamente para página única para facilitar a leitura.', 'luiz0067-pdf-flipbook' ) }
									/>

									<div className="mt-4 pt-3 border-top">
										<label className="form-label fw-bold d-block mb-2">
											{ __( 'Cor de Fundo do Palco', 'luiz0067-pdf-flipbook' ) }
										</label>
										<ColorPalette
											colors={ PRESET_BG_COLORS }
											value={ backgroundColor }
											onChange={ ( color ) => setAttributes( { backgroundColor: color || '#1e293b' } ) }
										/>
									</div>
								</PanelBody>
							);
						}

						if ( tab.name === 'controls' ) {
							return (
								<PanelBody title={ __( 'Barra de Ferramentas e Recursos', 'luiz0067-pdf-flipbook' ) } initialOpen={ true }>
									<RangeControl
										label={ __( 'Página Inicial de Abertura', 'luiz0067-pdf-flipbook' ) }
										value={ startPage }
										onChange={ ( value ) => setAttributes( { startPage: value } ) }
										min={ 1 }
										max={ 50 }
										help={ __( 'Define em qual página o leitor se abre automaticamente.', 'luiz0067-pdf-flipbook' ) }
									/>

									<div className="mt-3 pt-3 border-top">
										<h4 className="fs-6 fw-bold mb-2 text-dark">
											{ __( 'Botões e Ferramentas Visíveis', 'luiz0067-pdf-flipbook' ) }
										</h4>
										<ToggleControl
											label={ __( 'Ativar Botão de Download do PDF', 'luiz0067-pdf-flipbook' ) }
											checked={ enableDownload }
											onChange={ ( value ) => setAttributes( { enableDownload: value } ) }
											help={ __( 'Exibe o ícone para baixar o arquivo original.', 'luiz0067-pdf-flipbook' ) }
										/>

										<ToggleControl
											label={ __( 'Ativar Modo Tela Cheia', 'luiz0067-pdf-flipbook' ) }
											checked={ enableFullscreen }
											onChange={ ( value ) => setAttributes( { enableFullscreen: value } ) }
											help={ __( 'Permite expandir o livro em tela cheia via Fullscreen API.', 'luiz0067-pdf-flipbook' ) }
										/>

										<ToggleControl
											label={ __( 'Efeito Sonoro de Papel Folheando', 'luiz0067-pdf-flipbook' ) }
											checked={ enableSound }
											onChange={ ( value ) => setAttributes( { enableSound: value } ) }
											help={ __( 'Reproduz um efeito acústico sutil ao virar páginas com Web Audio API nativo.', 'luiz0067-pdf-flipbook' ) }
										/>

										<ToggleControl
											label={ __( 'Controles de Zoom (+ / -)', 'luiz0067-pdf-flipbook' ) }
											checked={ enableZoom }
											onChange={ ( value ) => setAttributes( { enableZoom: value } ) }
											help={ __( 'Permite aproximar e afastar a visualização das páginas.', 'luiz0067-pdf-flipbook' ) }
										/>

										<ToggleControl
											label={ __( 'Reprodução Automática (Autoplay)', 'luiz0067-pdf-flipbook' ) }
											checked={ enableAutoplay }
											onChange={ ( value ) => setAttributes( { enableAutoplay: value } ) }
											help={ __( 'Avança as páginas automaticamente em intervalos regulares (como no catálogo interativo).', 'luiz0067-pdf-flipbook' ) }
										/>

										{ enableAutoplay && (
											<RangeControl
												label={ __( 'Intervalo do Autoplay (segundos)', 'luiz0067-pdf-flipbook' ) }
												value={ autoplayInterval || 5 }
												onChange={ ( value ) => setAttributes( { autoplayInterval: value } ) }
												min={ 2 }
												max={ 20 }
												step={ 1 }
											/>
										) }
									</div>

									<div className="mt-4 pt-3 border-top">
										<label className="form-label fw-bold d-block mb-2">
											{ __( 'Cor de Destaque / Botões', 'luiz0067-pdf-flipbook' ) }
										</label>
										<ColorPalette
											colors={ PRESET_THEME_COLORS }
											value={ themeColor }
											onChange={ ( color ) => setAttributes( { themeColor: color || '#0d6efd' } ) }
										/>
									</div>
								</PanelBody>
							);
						}

						return null;
					} }
				</TabPanel>
			</InspectorControls>

			{ /* RENDERIZAÇÃO WYSIWYG NATIVA NO CANVAS DO EDITOR */ }
			<div className="luiz0067-flipbook-container card shadow-lg border-0">
				{ ! hasContent ? (
					// Estado de Placeholder com chamada para ação no editor
					<div
						className="luiz0067-flipbook-placeholder text-center p-5 rounded"
						style={ { minHeight: '380px', backgroundColor: backgroundColor || '#1e293b' } }
					>
						<div className="placeholder-content-box bg-dark bg-opacity-75 p-4 rounded-4 shadow border border-secondary d-inline-block text-white" style={ { maxWidth: '520px' } }>
							<div className="mb-3">
								<i className="fa-solid fa-book-open-reader fa-3x text-primary"></i>
							</div>
							<h4 className="fw-bold text-white mb-2">
								{ __( 'Leitor Interativo Flipbook 3D', 'luiz0067-pdf-flipbook' ) }
							</h4>
							<p className="text-light text-opacity-75 small mb-4">
								{ __( 'Transforme catálogos, revistas ou documentos PDF em uma experiência tridimensional imersiva de virar páginas.', 'luiz0067-pdf-flipbook' ) }
							</p>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ onSelectPdf }
									allowedTypes={ [ 'application/pdf' ] }
									value={ pdfUrl }
									render={ ( { open } ) => (
										<Button
											variant="primary"
											onClick={ open }
											className="btn-lg px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow"
											style={ { backgroundColor: themeColor, borderColor: themeColor } }
										>
											<i className="fa-solid fa-upload"></i>
											{ __( 'Selecionar Arquivo PDF', 'luiz0067-pdf-flipbook' ) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
						</div>
					</div>
				) : (
					// Estado WYSIWYG com maquete 3D realista
					<div
						className="luiz0067-flipbook-wrapper position-relative overflow-hidden"
						style={ { height: bookHeight, backgroundColor } }
					>
						<div className="luiz0067-flipbook-stage d-flex align-items-center justify-content-center h-100 p-3">
							<div
								className={ `luiz0067-mock-book shadow-2xl ${
									displayMode === 'double-page' ? 'double-mode' : 'single-mode'
								}` }
							>
								{ displayMode === 'double-page' ? (
									// Simulação de duas páginas abertas
									<div className="mock-spread d-flex">
										<div className="mock-page left-page d-flex flex-column justify-content-between p-4 bg-white text-dark shadow-sm">
											<div className="page-header d-flex justify-content-between text-muted border-bottom pb-2">
												<small className="fw-bold text-uppercase">{ pdfTitle || 'Catálogo Digital' }</small>
												<small>Pág. { previewPage }</small>
											</div>
											<div className="page-body my-auto text-center py-4">
												<div className="page-illustration mx-auto mb-3 rounded d-flex align-items-center justify-content-center bg-light text-secondary border" style={ { height: '140px' } }>
													<i className="fa-solid fa-file-pdf fa-3x text-danger opacity-75"></i>
												</div>
												<h5 className="fw-bold text-secondary mb-1">
													{ pdfTitle || __( 'Página Esquerda', 'luiz0067-pdf-flipbook' ) }
												</h5>
												<p className="text-muted small">
													{ __( 'Visualização de alta definição renderizada via PDF.js', 'luiz0067-pdf-flipbook' ) }
												</p>
											</div>
											<div className="page-footer text-muted border-top pt-2 d-flex justify-content-between small">
												<span>luiz0067-pdf-flipbook</span>
												<span>{ previewPage }</span>
											</div>
										</div>

										<div className="mock-spine"></div>

										<div className="mock-page right-page d-flex flex-column justify-content-between p-4 bg-white text-dark shadow-sm">
											<div className="page-header d-flex justify-content-between text-muted border-bottom pb-2">
												<small>Pág. { previewPage + 1 }</small>
												<small className="fw-bold text-uppercase">{ __( 'Flipbook 3D', 'luiz0067-pdf-flipbook' ) }</small>
											</div>
											<div className="page-body my-auto text-center py-4">
												<div className="page-illustration mx-auto mb-3 rounded d-flex align-items-center justify-content-center bg-light text-secondary border" style={ { height: '140px' } }>
													<i className="fa-solid fa-book-open fa-3x text-primary opacity-75"></i>
												</div>
												<h5 className="fw-bold text-secondary mb-1">
													{ __( 'Página Direita', 'luiz0067-pdf-flipbook' ) }
												</h5>
												<p className="text-muted small">
													{ __( 'Dobre o canto ou clique nas setas para folhear realisticamente.', 'luiz0067-pdf-flipbook' ) }
												</p>
											</div>
											<div className="page-footer text-muted border-top pt-2 d-flex justify-content-between small">
												<span>{ previewPage + 1 }</span>
												<span>Bootstrap 5 & FA6</span>
											</div>
										</div>
									</div>
								) : (
									// Simulação de página única
									<div className="mock-spread single-spread">
										<div className="mock-page single-page d-flex flex-column justify-content-between p-4 bg-white text-dark shadow-lg">
											<div className="page-header d-flex justify-content-between text-muted border-bottom pb-2">
												<small className="fw-bold text-uppercase">{ pdfTitle || 'Catálogo Digital' }</small>
												<small>Pág. { previewPage }</small>
											</div>
											<div className="page-body my-auto text-center py-5">
												<div className="page-illustration mx-auto mb-3 rounded d-flex align-items-center justify-content-center bg-light text-secondary border" style={ { height: '180px' } }>
													<i className="fa-solid fa-file-pdf fa-4x text-danger opacity-75"></i>
												</div>
												<h4 className="fw-bold text-secondary mb-2">{ pdfTitle || 'Documento' }</h4>
												<p className="text-muted small px-3">
													{ __( 'Modo de folha única ativado. Ideal para smartphones e leitura focada.', 'luiz0067-pdf-flipbook' ) }
												</p>
											</div>
											<div className="page-footer text-muted border-top pt-2 text-center small">
												{ previewPage }
											</div>
										</div>
									</div>
								) }
							</div>
						</div>

						{ /* Dica de edição flutuante */ }
						<div className="luiz0067-editor-badge position-absolute top-0 start-0 m-3 px-3 py-1 bg-dark bg-opacity-75 text-white rounded-pill small d-flex align-items-center gap-2 shadow">
							<span className="badge bg-success rounded-pill">{ __( 'WYSIWYG', 'luiz0067-pdf-flipbook' ) }</span>
							<span>{ pdfTitle || 'PDF Carregado' }</span>
						</div>
					</div>
				) }

				{ /* Barra de ferramentas inferior com botões fiéis ao frontend */ }
				<div
					className="luiz0067-flipbook-toolbar card-footer bg-dark text-white d-flex align-items-center justify-content-between px-3 py-2 border-0"
					style={ { borderTop: `2px solid ${ themeColor }` } }
				>
					{ /* Navegação de Páginas */ }
					<div className="d-flex align-items-center gap-2">
						<button
							type="button"
							className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center"
							title={ __( 'Página Anterior', 'luiz0067-pdf-flipbook' ) }
							onClick={ () => setPreviewPage( Math.max( 1, previewPage - 2 ) ) }
							disabled={ ! hasContent || previewPage <= 1 }
							style={ { minWidth: '34px', height: '34px' } }
						>
							<i className="fa-solid fa-chevron-left"></i>
						</button>

						<div className="d-flex align-items-center text-white small px-2">
							<span>{ __( 'Página', 'luiz0067-pdf-flipbook' ) }</span>
							<span className="mx-1 fw-bold text-warning">{ previewPage }</span>
							<span>{ __( 'de', 'luiz0067-pdf-flipbook' ) }</span>
							<span className="ms-1 fw-bold">12</span>
						</div>

						<button
							type="button"
							className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center"
							title={ __( 'Próxima Página', 'luiz0067-pdf-flipbook' ) }
							onClick={ () => setPreviewPage( previewPage + 2 ) }
							disabled={ ! hasContent }
							style={ { minWidth: '34px', height: '34px' } }
						>
							<i className="fa-solid fa-chevron-right"></i>
						</button>
					</div>

					{ /* Controles e Ações */ }
					<div className="d-flex align-items-center gap-2">
						{ enableZoom && (
							<div className="btn-group btn-group-sm">
								<button
									type="button"
									className="btn btn-outline-light"
									title={ __( 'Diminuir Zoom', 'luiz0067-pdf-flipbook' ) }
								>
									<i className="fa-solid fa-magnifying-glass-minus"></i>
								</button>
								<button
									type="button"
									className="btn btn-outline-light"
									title={ __( 'Aumentar Zoom', 'luiz0067-pdf-flipbook' ) }
								>
									<i className="fa-solid fa-magnifying-glass-plus"></i>
								</button>
							</div>
						) }

						{ enableSound && (
							<button
								type="button"
								className="btn btn-sm btn-outline-light"
								title={ __( 'Efeito Sonoro de Papel', 'luiz0067-pdf-flipbook' ) }
								style={ { minWidth: '34px', height: '34px' } }
							>
								<i className="fa-solid fa-volume-high text-info"></i>
							</button>
						) }

						{ enableFullscreen && (
							<button
								type="button"
								className="btn btn-sm btn-outline-light"
								title={ __( 'Tela Cheia', 'luiz0067-pdf-flipbook' ) }
								style={ { minWidth: '34px', height: '34px' } }
							>
								<i className="fa-solid fa-expand"></i>
							</button>
						) }

						{ enableDownload && pdfUrl && (
							<a
								href={ pdfUrl }
								target="_blank"
								rel="noopener noreferrer"
								className="btn btn-sm text-white d-flex align-items-center gap-1 shadow-sm px-3"
								style={ { backgroundColor: themeColor, borderColor: themeColor } }
								title={ __( 'Baixar Arquivo PDF Original', 'luiz0067-pdf-flipbook' ) }
							>
								<i className="fa-solid fa-download"></i>
								<span className="d-none d-md-inline">{ __( 'Download', 'luiz0067-pdf-flipbook' ) }</span>
							</a>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}
