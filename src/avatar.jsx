import React from 'react';
import Konva from 'konva/src/Core';
import EXIF from 'exif-js_fixed';
import LoadImage from 'blueimp-load-image';
import 'konva/src/shapes/Image';
import 'konva/src/shapes/Circle';
import 'konva/src/shapes/Rect';
import 'konva/src/shapes/Path';
import 'konva/src/Animation';
import 'konva/src/DragAndDrop';

class Avatar extends React.Component {

  static defaultProps = {
    shadingColor: 'grey',
    shadingOpacity: 0.6,
    cropColor: 'white',
    closeIconColor: 'white',
    lineWidth: 4,
    minCropRadius: 30,
    backgroundColor: 'grey',
    mimeTypes: 'image/jpeg,image/png',
    exportAsSquare: false,
    exportSize: undefined,
    exportMimeType: 'image/png',
    cropShape: 'circle',
    exportQuality: 1.0,
    mobileScaleSpeed: 0.5, // experimental
    onClose: () => {
    },
    onCrop: () => {
    },
    onFileLoad: () => {
    },
    onImageLoad: () => {
    },
    onBeforeFileLoad: () => {
    },
    label: `Drag'&Drop/Choose a file`,
    labelStyle: {
      fontSize: '1.25em',
      fontWeight: '700',
      color: 'black',
      display: 'inline-block',
      fontFamily: 'sans-serif',
      cursor: 'pointer'
    },
    borderStyle: {
      border: '2px solid #979797',
      borderStyle: 'dashed',
      borderRadius: '8px',
      textAlign: 'center'
    },
    closeButtonStyle: {
      position: 'absolute',
      zIndex: 999,
      cursor: 'pointer',
      left: '10px',
      top: '10px'
    },
  };

  constructor(props) {
    super(props);
    const containerId = this.generateHash('avatar_container');
    const loaderId = this.generateHash('avatar_loader');
    this.onFileLoad = this.onFileLoad.bind(this);
    this.onDragFile = this.onDragFile.bind(this);
    this.onDropFile = this.onDropFile.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.state = {
      imgWidth: 0,
      imgHeight: 0,
      scale: 1,
      containerId,
      loaderId,
      lastMouseY: 0,
      showLoader: !(this.props.src || this.props.img)
    };
  }

  get lineWidth() {
    return this.props.lineWidth;
  }

  get containerId() {
    return this.state.containerId;
  }

  get closeIconColor() {
    return this.props.closeIconColor;
  }

  get closeIcon() {
    const { closeIcon } = this.props;
    if (closeIcon) {
      return closeIcon;
    }

    return (
      <svg
        viewBox="0 0 475.2 475.2"
        width="20px"
        height="20px"
      >
        <g>
          <path
            d="M405.6,69.6C360.7,24.7,301.1,0,237.6,0s-123.1,24.7-168,69.6S0,174.1,0,237.6s24.7,123.1,69.6,168s104.5,69.6,168,69.6    s123.1-24.7,168-69.6s69.6-104.5,69.6-168S450.5,114.5,405.6,69.6z M386.5,386.5c-39.8,39.8-92.7,61.7-148.9,61.7    s-109.1-21.9-148.9-61.7c-82.1-82.1-82.1-215.7,0-297.8C128.5,48.9,181.4,27,237.6,27s109.1,21.9,148.9,61.7    C468.6,170.8,468.6,304.4,386.5,386.5z"
            fill={this.closeIconColor}/>
          <path
            d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1    l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4    c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"
            fill={this.closeIconColor}/>
        </g>
      </svg>
    );
  }

  get cropColor() {
    return this.props.cropColor;
  }

  get loaderId() {
    return this.state.loaderId;
  }

  get mimeTypes() {
    return this.props.mimeTypes;
  }

  get backgroundColor() {
    return this.props.backgroundColor;
  }

  get cropShape() {
    return this.props.cropShape;
  }

  get shadingColor() {
    return this.props.shadingColor;
  }

  get shadingOpacity() {
    return this.props.shadingOpacity;
  }

  get mobileScaleSpeed() {
    return this.props.mobileScaleSpeed;
  }

  get cropRadius() {
    return this.state.cropRadius;
  }

  get minCropRadius() {
    return this.props.minCropRadius;
  }

  get scale() {
    return this.state.scale;
  }

  get width() {
    return this.state.imgWidth;
  }

  get halfWidth() {
    return this.state.imgWidth / 2;
  }

  get height() {
    return this.state.imgHeight;
  }

  get halfHeight() {
    return this.state.imgHeight / 2;
  }

  get image() {
    return this.state.image;
  }

  generateHash(prefix) {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return prefix + '-' + s4() + '-' + s4() + '-' + s4();
  }

  onCloseCallback() {
    this.props.onClose();
  }

  onCropCallback(img) {
    this.props.onCrop(img);
  }

  onFileLoadCallback(file) {
    this.props.onFileLoad(file);
  }

  onBeforeFileLoadCallback(elem) {
    this.props.onBeforeFileLoad(elem);
  }

  onImageLoadCallback(image) {
    this.props.onImageLoad(image);
  }

  componentDidMount() {
    if (this.state.showLoader) return;

    const image = this.props.img || new Image();
    image.crossOrigin = 'Anonymous';
    if (!this.props.img && this.props.src) image.src = this.props.src;
    this.setState({ image }, () => {
      if (this.image.complete) return this.init();
      this.image.onload = () => {
        this.onImageLoadCallback(this.image);
        this.init();
      };
    });
  }

  onDragFile(evt) {
    evt.preventDefault();
  }

  onDropFile(evt) {
    evt.preventDefault();
    this.onBeforeFileLoadCallback(evt);

    if (evt.dataTransfer.items && evt.dataTransfer.items.length >= 0) {
      const file = evt.dataTransfer.items[0].getAsFile();
      this.onFileLoadCallback(file);

      const ref = this;
      EXIF.getData(file, function () {
        let exifOrientation = EXIF.getTag(this, 'Orientation');
        LoadImage(
          file,
          function (image, data) {
            ref.setState({ image, file, showLoader: false });
            ref.init();
          },
          { orientation: exifOrientation, meta: true }
        );
      });
    }
  }

  onFileLoad(e) {
    e.preventDefault();

    this.onBeforeFileLoadCallback(e);
    if (!e.target.value) return;
    let file = e.target.files[0];
    this.onFileLoadCallback(file);

    const ref = this;
    EXIF.getData(file, function () {
      let exifOrientation = EXIF.getTag(this, 'Orientation');
      LoadImage(
        file,
        function (image, data) {
          ref.setState({ image, file, showLoader: false });
          ref.init();
        },
        { orientation: exifOrientation, meta: true }
      );
    });
  }

  onCloseClick() {
    this.setState({ showLoader: true }, () => this.onCloseCallback());
  }

  init() {
    const { height, minCropRadius, cropRadius } = this.props;
    const originalWidth = this.image.width;
    const originalHeight = this.image.height;
    const ration = originalHeight / originalWidth;
    const { imageWidth, imageHeight } = this.props;
    let imgHeight;
    let imgWidth;

    if (imageHeight && imageWidth) {
      console.warn('The imageWidth and imageHeight properties can not be set together, using only imageWidth.');
    }

    if (imageHeight && !imageWidth) {
      imgHeight = imageHeight || originalHeight;
      imgWidth = imgHeight / ration;
    } else if (imageWidth) {
      imgWidth = imageWidth;
      imgHeight = imgWidth * ration || originalHeight;
    } else {
      imgHeight = height || originalHeight;
      imgWidth = imgHeight / ration;
    }

    const scale = imgHeight / originalHeight;
    const calculatedRadius = Math.max(minCropRadius, (cropRadius || Math.min(imgWidth, imgHeight) / 3));

    this.setState({
      imgWidth,
      imgHeight,
      scale,
      cropRadius: calculatedRadius
    }, this.initCanvas);
  }

  initCanvas() {
    const stage = this.initStage();
    const background = this.initBackground();
    const shading = this.initShading();
    const crop = this.initCrop();
    const cropStroke = this.initCropStroke();
    const resize = this.initResize();
    const resizeIcon = this.initResizeIcon();

    const layer = new Konva.Layer();

    layer.add(background);
    layer.add(shading);
    layer.add(cropStroke);
    layer.add(crop);

    layer.add(resize);
    layer.add(resizeIcon);

    stage.add(layer);

    let scaledRadius, calcLeft, calcTop, calcRight, calcBottom, calcScaleRadius, calcResizerX, calcResizerY,
      isLeftCorner, isTopCorner, isRightCorner, isBottomCorner, isNotOutOfScale;
    if (this.cropShape === 'rect') {
      scaledRadius = (scale = 0) => crop.width() - scale;
      calcLeft = () => 1;
      calcTop = () => 1;
      calcRight = () => stage.width() - crop.width() - 1;
      calcBottom = () => stage.height() - crop.height() - 1;
      calcScaleRadius = scale => scaledRadius(scale) >= this.minCropRadius ? scale : 0;
      calcResizerX = () => crop.x() + crop.width();
      calcResizerY = () => crop.y();
      isLeftCorner = () => crop.x() <= 0;
      isTopCorner = () => crop.y() <= 0;
      isRightCorner = () => crop.x() + crop.width() >= stage.width();
      isBottomCorner = () => crop.y() + crop.height() >= stage.height();
      isNotOutOfScale = scale => !isLeftCorner(scale) && !isRightCorner(scale) && !isBottomCorner(scale) && !isTopCorner(scale);
    } else {
      scaledRadius = (scale = 0) => crop.radius() - scale;
      calcLeft = () => crop.radius() + 1;
      calcTop = () => crop.radius() + 1;
      calcRight = () => stage.width() - crop.radius() - 1;
      calcBottom = () => stage.height() - crop.radius() - 1;
      calcScaleRadius = scale => scaledRadius(scale) >= this.minCropRadius ? scale : crop.radius() - this.minCropRadius;
      calcResizerX = x => x + (crop.radius() * 0.86);
      calcResizerY = y => y - (crop.radius() / 2);
      isLeftCorner = scale => crop.x() - scaledRadius(scale) < 0;
      isTopCorner = scale => crop.y() - scaledRadius(scale) < 0;
      isRightCorner = scale => crop.x() + scaledRadius(scale) > stage.width();
      isBottomCorner = scale => crop.y() + scaledRadius(scale) > stage.height();
      isNotOutOfScale = scale => !isLeftCorner(scale) && !isRightCorner(scale) && !isBottomCorner(scale) && !isTopCorner(scale);
    }
    const moveResizer = (x, y) => {
      resize.x(calcResizerX(x) - 8);
      resize.y(calcResizerY(y) - 8);
      resizeIcon.x(calcResizerX(x) - 8);
      resizeIcon.y(calcResizerY(y) - 10);
    };

    const getPreview = () => {
      let cropWidth, cropHeight, cropX, cropY;
      if (this.cropShape === 'rect') {
        cropWidth = crop.width();
        cropHeight = crop.height();
        cropX = crop.x();
        cropY = crop.y();
      } else {
        cropWidth = crop.radius() * 2;
        cropHeight = crop.radius() * 2;
        cropX = crop.x() - crop.radius();
        cropY = crop.y() - crop.radius();
      }

      let cropSource = crop;
      let xScale = 1;
      let yScale = 1;
      if (this.props.exportAsSquare || this.cropShape === 'rect') {
        const fullSizeImage = new Konva.Image({ image: this.image });
        cropSource = fullSizeImage;
        xScale = fullSizeImage.width() / background.width();
        yScale = fullSizeImage.height() / background.height();
      }

      const width = cropWidth * xScale;
      const height = cropHeight * yScale;
      const pixelRatio = this.props.exportSize ? this.props.exportSize / width : undefined;

      return cropSource.toDataURL({
        x: cropX * xScale,
        y: cropY * yScale,
        width,
        height,
        pixelRatio,
        mimeType: this.props.exportMimeType,
        quality: this.props.exportQuality
      });
    };

    const onScaleCallback = (scaleY) => {
      const scale = scaleY > 0 || isNotOutOfScale(scaleY) ? scaleY : 0;
      const scaleRadius = calcScaleRadius(scale);
      if (this.cropShape === 'rect') {
        cropStroke.width(cropStroke.width() - scaleRadius);
        cropStroke.height(cropStroke.height() - scaleRadius);
        cropStroke.x(cropStroke.x() + scaleRadius / 2);
        cropStroke.y(cropStroke.y() + scaleRadius / 2);
        crop.width(crop.width() - scaleRadius);
        crop.height(crop.height() - scaleRadius);
        crop.x(crop.x() + scaleRadius / 2);
        crop.y(crop.y() + scaleRadius / 2);
      } else {
        cropStroke.radius(cropStroke.radius() - scaleRadius);
        crop.radius(crop.radius() - scaleRadius);
      }
      resize.fire('resize');
    };

    this.onCropCallback(getPreview());

    crop.on('dragmove', () => crop.fire('resize'));
    crop.on('dragend', () => this.onCropCallback(getPreview()));

    crop.on('resize', () => {
      const x = isLeftCorner() ? calcLeft() : (isRightCorner() ? calcRight() : crop.x());
      const y = isTopCorner() ? calcTop() : (isBottomCorner() ? calcBottom() : crop.y());
      moveResizer(x, y);
      crop.setFillPatternOffset({ x: x / this.scale, y: y / this.scale });
      crop.x(x);
      cropStroke.x(x);
      crop.y(y);
      cropStroke.y(y);
    });

    crop.on('mouseenter', () => stage.container().style.cursor = 'move');
    crop.on('mouseleave', () => stage.container().style.cursor = 'default');
    crop.on('dragstart', () => stage.container().style.cursor = 'move');
    crop.on('dragend', () => stage.container().style.cursor = 'default');

    resize.on('touchstart', (evt) => {
      resize.on('dragmove', (dragEvt) => {
        if (dragEvt.evt.type !== 'touchmove') return;
        const scaleY = (dragEvt.evt.changedTouches['0'].pageY - evt.evt.changedTouches['0'].pageY) || 0;
        onScaleCallback(scaleY * this.mobileScaleSpeed);
      });
    });

    resize.on('dragmove', (evt) => {
      if (evt.evt.type === 'touchmove') return;
      const newMouseY = evt.evt.y;
      const ieScaleFactor = newMouseY ? (newMouseY - this.state.lastMouseY) : undefined;
      const scaleY = evt.evt.movementY || ieScaleFactor || 0;
      this.setState({
        lastMouseY: newMouseY,
      });
      onScaleCallback(scaleY);
      crop.fire('resize');
    });
    resize.on('dragend', () => this.onCropCallback(getPreview()));

    resize.on('resize', () => moveResizer(crop.x(), crop.y()));

    resize.on('mouseenter', () => stage.container().style.cursor = 'nesw-resize');
    resize.on('mouseleave', () => stage.container().style.cursor = 'default');
    resize.on('dragstart', (evt) => {
      this.setState({
        lastMouseY: evt.evt.y,
      });
      stage.container().style.cursor = 'nesw-resize';
    });
    resize.on('dragend', () => stage.container().style.cursor = 'default');
  }

  initStage() {
    return new Konva.Stage({
      container: this.containerId,
      width: this.width,
      height: this.height
    });
  }

  initBackground() {
    return new Konva.Image({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      image: this.image
    });
  }

  initShading() {
    return new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: this.shadingColor,
      strokeWidth: 4,
      opacity: this.shadingOpacity
    });
  }

  initCrop() {
    if (this.cropShape === 'rect') {
      return this.initRectCrop();
    }
    return new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      fillPatternImage: this.image,
      fillPatternOffset: {
        x: this.halfWidth / this.scale,
        y: this.halfHeight / this.scale
      },
      fillPatternScale: {
        x: this.scale,
        y: this.scale
      },
      opacity: 1,
      draggable: true,
      dashEnabled: true,
      dash: [10, 5]
    });
  }

  initRectCrop() {
    return new Konva.Rect({
      x: this.halfWidth - this.cropRadius,
      y: this.halfHeight - this.cropRadius,
      width: this.cropRadius * 2,
      height: this.cropRadius * 2,
      fillPatternImage: this.image,
      fillPatternOffset: {
        x: (this.halfWidth - this.cropRadius) / this.scale,
        y: (this.halfHeight - this.cropRadius) / this.scale,
      },
      fillPatternScale: {
        x: this.scale,
        y: this.scale
      },
      opacity: 1,
      draggable: true,
      dashEnabled: false,
      dash: [10, 5]
    });
  }

  initCropStroke() {
    if (this.cropShape === 'rect') {
      return this.initRectCropStroke();
    }
    return new Konva.Circle({
      x: this.halfWidth,
      y: this.halfHeight,
      radius: this.cropRadius,
      stroke: this.cropColor,
      strokeWidth: this.lineWidth,
      strokeScaleEnabled: true,
      dashEnabled: true,
      dash: [10, 5]
    });
  }

  initRectCropStroke() {
    return new Konva.Rect({
      x: this.halfWidth - this.cropRadius,
      y: this.halfHeight - this.cropRadius,
      width: this.cropRadius * 2,
      height: this.cropRadius * 2,
      stroke: this.cropColor,
      strokeWidth: this.lineWidth / 2,
      strokeScaleEnabled: true,
      dashEnabled: true,
      dash: [10, 5]
    });
  }

  initResize() {
    if (this.cropShape === 'rect') {
      return this.initRectResize();
    }
    return new Konva.Rect({
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 10,
      width: 16,
      height: 16,
      draggable: true,
      dragBoundFunc: function (pos) {
        return {
          x: this.getAbsolutePosition().x,
          y: pos.y
        };
      }
    });
  }

  initRectResize() {
    const x = this.halfWidth + this.cropRadius - 8;
    const y = this.halfHeight - this.cropRadius - 8;
    return new Konva.Rect({
      x,
      y,
      width: 16,
      height: 16,
      draggable: true,
      dragBoundFunc: function (pos) {
        return {
          x: this.getAbsolutePosition().x,
          y: pos.y
        };
      }
    });
  }

  initResizeIcon() {
    if (this.cropShape === 'rect') {
      return this.initRectResizeIcon();
    }
    return new Konva.Path({
      x: this.halfWidth + this.cropRadius * 0.86 - 8,
      y: this.halfHeight + this.cropRadius * -0.5 - 10,
      data: 'M47.624,0.124l12.021,9.73L44.5,24.5l10,10l14.661-15.161l9.963,12.285v-31.5H47.624z M24.5,44.5   L9.847,59.653L0,47.5V79h31.5l-12.153-9.847L34.5,54.5L24.5,44.5z',
      fill: this.cropColor,
      scale: {
        x: 0.2,
        y: 0.2
      }
    });
  }

  initRectResizeIcon() {
    return new Konva.Path({
      x: this.halfWidth + this.cropRadius - 8,
      y: this.halfHeight - this.cropRadius - 10,
      data: 'M47.624,0.124l12.021,9.73L44.5,24.5l10,10l14.661-15.161l9.963,12.285v-31.5H47.624z M24.5,44.5   L9.847,59.653L0,47.5V79h31.5l-12.153-9.847L34.5,54.5L24.5,44.5z',
      fill: this.cropColor,
      scale: {
        x: 0.2,
        y: 0.2
      }
    });
  }

  render() {
    const { width, height } = this.props;

    const style = {
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: this.backgroundColor,
      width: width || this.width,
      position: 'relative'
    };

    const inputStyle = {
      width: 0.1,
      height: 0.1,
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1,
    };

    const label = this.props.label;

    const labelStyle = { ...this.props.labelStyle, lineHeight: `${(height || 200)}px` };

    const borderStyle = {
      ...this.props.borderStyle,
      width: width || 200,
      height: height || 200
    };

    const closeButtonStyle = {
      all: 'unset',
      ...this.props.closeButtonStyle,
    };

    if (this.state.showLoader) {
      return (
        <div>
          <div style={borderStyle} onDragOver={this.onDragFile} onDrop={this.onDropFile}>
            <input
              onChange={this.onFileLoad}
              name={this.loaderId}
              type="file"
              id={this.loaderId}
              style={inputStyle}
              accept={this.mimeTypes}
            />
            <label htmlFor={this.loaderId} style={labelStyle}>{label}</label>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={style}>
          <button
            type="button"
            onClick={this.onCloseClick}
            style={closeButtonStyle}
            aria-label="Close"
          >
            {this.closeIcon}
          </button>
          <div id={this.containerId}/>
        </div>
      </div>
    );
  }
}

export default Avatar;
