require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片相关的数据
let imageDatas = require('../data/imageData.json');

// 利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(imageDatasArr) {
  for (let i=0; i<imageDatas.length; i++) {
    let simpleImageData = imageDatasArr[i];

    simpleImageData.imageURL = require('../images/' +simpleImageData.fileName);

    imageDatasArr[i] = simpleImageData;
  }

  return imageDatasArr;
})(imageDatas);

const getRangeRandom = (low, high) => {
  return Math.ceil(Math.random() * (high - low) + low);
}

// 获取 0-30° 之间的一个任意正负值
const get30DegRandom = () => {
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

class ImageFigure extends React.Component {

  handleClick(event) {

    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    let styleObj = {};

    // 如果 props 属性指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    // 如果图片的旋转角度有值并且不为0，添加旋转角度
    if (this.props.arrange.rotate) {
      ['MozTransform', 'msTransform', 'WebkitTransform', 'transform'].forEach((value) => {
        styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      })
    }

    if (this.props.arrange.isCenter) {
      styleObj.zIndex = 11;
    }

    let imageFigureClassName = 'image-figure';
        imageFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className={imageFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="image-title">{this.props.data.title}</h2>
          <div className="image-back" onClick={this.handleClick.bind(this)}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
}

class ControllerUnit extends React.Component {

  handleClick(event) {

    // 如果点击的是当前正在选中状态的按钮，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }

    event.stopPropagation();
    event.preventDefault();
  }

  render() {

    let controllerUnitClassName = 'controller-unit';

    // 如果对应的是居中的图片，显示控制按钮的居中态
    if (this.props.arrange.isCenter) {
      controllerUnitClassName += ' is-center';

      // 如果同时对应的是翻转图片
      if(this.props.arrange.isInverse) {
        controllerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick.bind(this)}></span>
    )
  }
}

class GalleryApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      imagesArrangeArr: [
        {
          /*
          pos: {
            left: '0',
            top: '0'
          },
          rotate: 0,  // 旋转
          isInverse: false,  // 图片是否翻转
          isCenter: false  // 图片是否居中
          */
        }
      ]
    }
  }

  // 利用 rearrange 函数，居中对应 index 的图片
  center(index) {
    return () => {
      this.rearrange(index);
    }
  }

  // 翻转图片
  inverse(index) {
    return () => {
      let imagesArrangeArr = this.state.imagesArrangeArr;

      imagesArrangeArr[index].isInverse = !imagesArrangeArr[index].isInverse;

      this.setState({
        imagesArrangeArr: imagesArrangeArr
      });
    }
  }

  // 重新布局所有图片
  rearrange(centerIndex) {
    let imagesArrangeArr = this.state.imagesArrangeArr,
        Constant = this.props.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imagesArrangeTopArr = [],
        topImagesNum = Math.floor(Math.random() * 2),

      // 取一个或者不取
      topImageSpliceIndex = 0,
      imagesArrangeCenterArr = imagesArrangeArr.splice(centerIndex, 1);

      // 首先居中 centerIndex 的图片
      imagesArrangeCenterArr[0].pos = centerPos;

      // 居中的 centerIndex 的图片不需要旋转
      imagesArrangeCenterArr[0].rotate = 0;
      imagesArrangeCenterArr[0].isCenter = true;

      for(let i=0; i<imagesArrangeArr.length; i++) {
        imagesArrangeArr[i].pos = centerPos;
      }


      // 取出要布局上侧的图片的状态信息
      Math.ceil(Math.random() * (imagesArrangeArr.length - topImagesNum));
      imagesArrangeTopArr = imagesArrangeArr.splice(topImageSpliceIndex, topImagesNum);

      // 布局位于上侧的图片
      imagesArrangeTopArr.forEach((value, index) => {
        imagesArrangeTopArr[index] = {
          pos: {
            top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
            left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
          },
          rotate: get30DegRandom(),
          isCenter: false
        }
      })

      // 布局左右两侧的图片
      for (let i=0, j=imagesArrangeArr.length, k=j/2; i<j; i++) {
        let hPosRangeLORX = null;

        // 前半部分布局左边， 右半部份布局右边
        if (i < k) {
          hPosRangeLORX = hPosRangeLeftSecX;
        } else {
          hPosRangeLORX = hPosRangeRightSecX;
        }

        imagesArrangeArr[i] = {
          pos: {
            top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
            left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
          },
          rotate: get30DegRandom(),
          isCenter: false
        };
      }

      if (imagesArrangeTopArr && imagesArrangeTopArr[0]) {
        imagesArrangeArr.splice(topImageSpliceIndex, 0, imagesArrangeTopArr[0]);
      }

      imagesArrangeArr.splice(centerIndex, 0, imagesArrangeCenterArr[0]);

      this.setState({
        imagesArrangeArr: imagesArrangeArr
      });
  }

  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount() {

    // 首先拿到舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    // 拿到一个 imageFigure 的大小
    let imageFigureDOM = ReactDOM.findDOMNode(this.refs.imageFigure0),
        imageW = imageFigureDOM.scrollWidth,
        imageH = imageFigureDOM.scrollHeight,
        halfImageW = Math.ceil(imageW / 2),
        halfImageH = Math.ceil(imageH / 2);

    // 计算中心图片的位置点
    this.props.Constant.centerPos = {
      left: halfStageW - halfImageW,
      top: halfStageH - halfImageH
    };

    // 计算左侧、右侧区域排布位置的取值范围
    this.props.Constant.hPosRange.leftSecX[0] = -halfImageW;
    this.props.Constant.hPosRange.leftSecX[1] = halfStageW - halfImageW * 3;
    this.props.Constant.hPosRange.rightSecX[0] = halfStageW + halfImageW;
    this.props.Constant.hPosRange.rightSecX[1] = stageW - halfImageW;
    this.props.Constant.hPosRange.y[0] = -halfImageH;
    this.props.Constant.hPosRange.y[1] = stageH - halfImageH;

    // 计算上侧区域图片排布位置的取值范围
    this.props.Constant.vPosRange.topY[0] = -halfImageH;
    this.props.Constant.vPosRange.topY[1] = halfStageH - halfImageH * 3;
    this.props.Constant.vPosRange.x[0] = halfStageW - halfImageW;
    this.props.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  render() {

    let controllerUnits = [],
      imageFigures = [];

    imageDatas.forEach((value, index) => {
      if (!this.state.imagesArrangeArr[index]) {
        this.state.imagesArrangeArr[index] = {
          pos: {
            left: 0,
            right: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        };
      }
      imageFigures.push(<ImageFigure data={value} ref={'imageFigure' + index}
        key={'imageFigure-' + index} arrange={this.state.imagesArrangeArr[index]}
        inverse={this.inverse(index)} center={this.center(index)} />);

      controllerUnits.push(<ControllerUnit arrange={this.state.imagesArrangeArr[index]}
        key={index} inverse={this.inverse(index)} center={this.center(index)}/>);

    })

    return (
      <section className="stage" ref="stage">
        <section className="image-section">
          {imageFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

GalleryApp.defaultProps = {
  Constant: {
    centerPos: {
      left: 0,
      right: 0
    },
    hPosRange: {
      leftSecX: [0, 0],
      rightSecX: [0, 0],
      y: [0, 0]
    },
    vPosRange: {
      x: [0, 0],
      topY: [0, 0]
    }
  }
};

export default GalleryApp;
