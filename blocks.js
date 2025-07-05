let blockID = 1;
let blockMap = new Map();
let rootStyles = getComputedStyle(document.documentElement);
let blockCutHeight = parseInt(rootStyles.getPropertyValue('--block-cut-y').trim(), 10);
let blockHeight = parseInt(rootStyles.getPropertyValue('--block-height').trim(), 10);

class Block {

    constructor(type, parts, color, spriteID, blockID, func, offsetX = 0, offsetY = 0) {
        this.parts = parts; this.color = color;  this.type = type;
        this.spriteID = spriteID; this.blockID = blockID; this.func = func;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.nextID = null;
        this.prevID = null;
    }

    render() {
        const block = document.createElement("div");
        block.className = this.type + ' ' + this.color;

        if (this.blockID != null) { 
            block.style.position = 'absolute';
            block.style.opacity = '0';
            block.className += ' block';
            block.id = this.blockID;
        }

        for(let i = 0; i < this.parts.length; i++) {
            if (this.parts[i][0] == 'text') {
                const label = document.createElement('span');
                label.textContent = this.parts[i][1];
                block.appendChild(label);
            }
            else if (this.parts[i][0] == 'input') {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = this.parts[i][1];
                input.style.width = (this.parts[i][1].length + 2) + 'ch';
                
                input.addEventListener('input', () => {
                    const value = input.value || input.placeholder || '';
                    input.style.width = (value.length + 2) + 'ch'; // +1 buffer
                });
                
                block.appendChild(input);
            }
            else {

            }
        }

        if (this.blockID != null) {
            const mainParent = this;

            function onMouseMove(event) {
                block.style.left = (event.clientX - mainParent.offsetX) + 'px';
                block.style.top = (event.clientY - mainParent.offsetY) + 'px';
                block.style.opacity = '1';
                
                bringToFront(block);
            }

            function onMouseUp(event) {
                mainParent.checkInsideWorkspace(event, block);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        if (this.blockID != null) this.makeDraggable(block);

        if (this.blockID == null) {
            const mainParent = this;

            block.addEventListener('mousedown', (event) => {
                if (event.target.tagName == 'INPUT') return;

                const offsetX = event.clientX - block.offsetLeft;
                const offsetY = event.clientY - block.offsetTop;

                const blocks = document.querySelector('.workspace');
                blockMap[blockID] = new Block(mainParent.type, mainParent.parts, mainParent.color, mainParent.spriteID, blockID, mainParent.func, offsetX, offsetY);
                blocks.appendChild(blockMap[blockID].render());
                blockID++;
            });
        }

        return block;
    }

    makeDraggable(block) {
        block.addEventListener('mousedown', ondragStart);
        let mainParent = this;

        function ondragStart(event) {
            if (event.target.tagName == 'INPUT') return;
            
            event.preventDefault();
            bringToFront(block);
            let count = 0;

            const offsetX = event.clientX - block.offsetLeft;
            const offsetY = event.clientY - block.offsetTop;

            function onMouseMove(event) {
                block.style.left = (event.clientX - offsetX) + 'px';
                block.style.top = (event.clientY - offsetY) + 'px';
                count++;

                if(mainParent.prevID != null) {
                    //log(blockMap[mainParent.prevID].nextID);
                    blockMap[mainParent.prevID].nextID = null;
                    mainParent.prevID = null;
                    //log(blockMap[mainParent.prevID].nextID);
                }

                mainParent.moveChildrenTo(event.clientX - offsetX, event.clientY - offsetY);
                //mainParent.dragChildren(event, offsetX, offsetY);
            }

            function onMouseUp(event) {
                mainParent.checkInsideWorkspace(event, block);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (mainParent.blockID != null) {
                    mainParent.checkCollision(block, event);
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    }

    checkInsideWorkspace(event, block) {
        const workspace = document.querySelector('.workspace');
        const workspaceRect = workspace.getBoundingClientRect();

        if (event.clientX < workspaceRect.left ||
            event.clientX > workspaceRect.right ||
            event.clientY < workspaceRect.top ||
            event.clientY > workspaceRect.bottom
        ) {
            block.remove();
            blockMap.delete(this.blockID);
            this.type = null;
            this.parts = null;
            this.color = null;
            this.spriteID = null;
            this.blockID = null;
            this.func = null;
        }
    }

    checkCollision(childBlock, event) {
        let blocks = document.getElementsByClassName('block');

        for(let block of blocks) {

            if (block == childBlock) continue;
            else if (this.blockID == blockMap[parseInt(block.id, 10)].prevID) continue;
            //else if (this.blockID == blockMap[parseInt(block.id, 10)].nextID) continue;
            else if (this.nextID != null && this.nextID == blockMap[parseInt(block.id, 10)].prevID) continue;
            //else if (this.prevID != null && this.prevID == blockMap[parseInt(block.id, 10)].nextID) continue;

            let blockRect = block.getBoundingClientRect();

            if (!(event.clientX < blockRect.left - 30 ||
                event.clientX > blockRect.right + 30 ||
                event.clientY < blockRect.top + blockHeight ||
                event.clientY > blockRect.bottom + blockHeight)
            ) {
                childBlock.style.top = (blockRect.top + blockHeight - blockCutHeight) + 'px';
                childBlock.style.left = (blockRect.left) + 'px';
            
                blockMap[parseInt(block.id, 10)].nextID = this.blockID;
                this.prevID = parseInt(block.id, 10);
/*
                if (this.prevID != null) log(this.prevID);
                else log('null');
                
                if (this.nextID != null) log(this.nextID);
                else log('null');

                log(block.id);
*/
                this.moveChildrenTo(blockRect.left, blockRect.top + blockHeight - blockCutHeight);           

                break;
            }
            
            if (!(event.clientX < blockRect.left - 30 ||
                event.clientX > blockRect.right + 30 ||
                event.clientY < blockRect.top - blockHeight ||
                event.clientY > blockRect.bottom - blockHeight)
            ) {              
                childBlock.style.top = (blockRect.top - blockHeight + blockCutHeight) + 'px';
                childBlock.style.left = (blockRect.left) + 'px';

                blockMap[parseInt(block.id, 10)].prevID = this.blockID;
                this.nextID = parseInt(block.id, 10);


/*
                if (this.prevID != null) log(this.prevID);
                else log('null');
                
                if (this.nextID != null)log(this.nextID);
                else log('null');

                log(block.id);
*/
                break;
            }
        }
    }

    moveChildrenTo(offsetX, offsetY) {
        let currID = this.nextID;
        let count = 1;

        while(currID != null) {
            const childBlock = document.getElementById(currID.toString());
            childBlock.style.left = (offsetX) + 'px';
            childBlock.style.top = (offsetY + (blockHeight - blockCutHeight)*count) + 'px';

            currID = blockMap[currID].nextID;
            count++;
        }
    }
}

function log(msg) {
    const debugBox = document.getElementById('debug');
    const p = document.createElement('div');
    p.textContent = msg;
    debugBox.appendChild(p);
    debugBox.scrollTop = debugBox.scrollHeight;
}


function bringToFront(block) {
    document.querySelectorAll('.block').forEach(el => {
        el.style.zIndex = 'auto';
    });

    block.style.zIndex = 1000;
}


export function createBlocks() {
    const blocks = document.querySelector('.blocks-available');
    let block = new Block("block-middle", [["text", "move"], ["input", "10"], ["text", "steps"]], "blue", null, null, () => {});
    blocks.appendChild(block.render());

    block = new Block("block-middle", [["text", "point in direction"], ["input", "90"]], "blue", null, null, () => {});
    blocks.appendChild(block.render());

    //block = new Block("block-middle", "point in direction 90", "blue", null, () => {});
    //blocks.appendChild(block.render());
}

