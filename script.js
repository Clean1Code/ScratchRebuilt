import { createBlocks } from './blocks.js';

const topBarButtons = document.getElementsByClassName('top-bar-button');
const interfaces = document.getElementsByClassName('interface');
const blockTypeButtons = document.getElementsByClassName('block-type-button');

//Set workspace
for(let button of topBarButtons) {
  button.addEventListener('click', () => {
      if (!button.classList.contains('top-bar-button-clicked')) {
          for(let btn of topBarButtons) {
              btn.classList.remove('top-bar-button-clicked');
              btn.classList.remove('top-bar-button-hover');
          }
          button.classList.toggle('top-bar-button-clicked');

          for(let inf of interfaces) {
              if (button.classList[0] == inf.classList[1]) inf.classList.add('active');
              else inf.classList.remove('active');
          }
      }
  });

  button.addEventListener('mouseover', () => {
      if (!button.classList.contains('top-bar-button-clicked')) {
          button.classList.toggle('top-bar-button-hover');
      }
  });

  button.addEventListener('mouseout', () => {
      if (!button.classList.contains('top-bar-button-clicked')) {
          button.classList.toggle('top-bar-button-hover');
      }
  });
}

for(let button of blockTypeButtons) {
    button.addEventListener('click', () => {
        for(let button of blockTypeButtons) {
            button.classList.remove('block-type-button-clicked');
        }

        button.classList.toggle('block-type-button-clicked');
    })
}

createBlocks();
