let scale = 1;
const el = document.querySelector('.map');
el.onwheel = zoom;

let intViewportHeight = window.innerHeight;
let intViewportWidth = window.innerWidth;
let compStyles = window.getComputedStyle(el);

let maxHeight = compStyles.getPropertyValue('max-height');
maxHeight =  parseInt(maxHeight.slice(0, -2));
let initialWidth = compStyles.getPropertyValue('width');
initialWidth = parseInt(initialWidth.slice(0,-2));
let initialHeight = compStyles.getPropertyValue('height');
initialHeight = parseInt(initialHeight.slice(0,-2));
let widthToHeightRatio = initialWidth/initialHeight;

console.log(initialHeight);
console.log(initialWidth);
console.log(widthToHeightRatio);
console.log(maxHeight);
console.log(intViewportHeight);
console.log(intViewportWidth);

let container = document.querySelector('html');


function zoom(event) {
  event.preventDefault();
  if(event.deltaY > 0){
    scale = scale - .1;
    if(scale < 1){
      scale = 1;
    }

  }
  else if(event.deltaY < 0){
    scale = scale + .1;

    if(scale * intViewportHeight > maxHeight){
      scale = scale -.1;
    }

  }

  el.style.height = `${scale*100}vh`;
  // el.style.top = `${-1 * (scale * intViewportHeight - intViewportHeight)/2}px`;

  // let width = scale * intViewportHeight * widthToHeightRatio;
  // console.log(`teest: ${width}, ${widthToHeightRatio}`);
  // if(width > intViewportWidth){
  //   el.style.left = `${-1 * (width - intViewportWidth)/2}px`;
  // }
  // else{
  //   el.style.left = 0;
  // }
}




