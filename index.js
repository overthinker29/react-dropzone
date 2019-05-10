import React, { Component } from 'react';
import { accept } from 'attr-accept';
import PropTypes from 'prop-types';

class Dropzone extends Component{

    getDefaultProps = () => {
        return {
            disableClick: false,
            disablePaste: false,
            multiple: true
        };
    };

    constructor(props){
        super(props);
        this.state = {
            isDragActive: false,
            showDropZone: false,
            showDropZone: false,
        };
    };

    propTypes = {
        onDrop: PropTypes.func,
        onPaste: PropTypes.func,
        onDropAccepted: PropTypes.func,
        onDropRejected: PropTypes.func,
        onDragEnter: PropTypes.func,
        onDragLeave: PropTypes.func,

        style: PropTypes.object,
        activeStyle: PropTypes.object,
        className: PropTypes.string,
        activeClassName: PropTypes.string,
        rejectClassName: PropTypes.string,

        disableClick: PropTypes.bool,
        disablePaste: PropTypes.bool,
        multiple: PropTypes.bool,
        accept: PropTypes.arrayOf(PropTypes.string),
    }

    componentDidMount = () => {
        window.addEventListener('dragenter',this.onDragEnter);
        window.addEventListener('dragleave',this.onDragLeave);
        window.addEventListener('dragover',this.onDragOver);
        window.addEventListener('drop',this.onDrop);
        window.addEventListener('paste',this.onPaste);
    };

    componentWillUnmount = () => {
        window.removeEventListener('dragenter', this.onDragEnter);
        window.removeEventListener('dragleave',this.onDragLeave);
        window.removeEventListener('dragover',this.onDragOver);
        window.removeEventListener('drop',this.onDrop);
        window.removeEventListener('paste',this.onPaste);
    };

    allFilesAccepted = (files) => {
        return files;//files.every(file => accept(file, this.props.accept));
    };

    onDragEnter = (event) => {
        event.preventDefault();
        // This is tricky. During the drag even the dataTransfer.files is null
        // But Chrome implements some drag store, which is accesible via dataTransfer.items
        let dataTransferItems = event.dataTransfer && event.dataTransfer.items ? event.dataTransfer.items : [];
        // Now we need to convert the DataTransferList to Array
        let itemsArray = Array.prototype.slice.call(dataTransferItems);
        let allFilesAccepted = this.allFilesAccepted(itemsArray);

        this.setState({
            isDragActive: allFilesAccepted,
            isDragReject: !allFilesAccepted,
            showDropZone: true,
        });

        if (this.props.onDragEnter) {
            this.props.onDragEnter(event);
        }
    };

    onDragOver = (event) => {
        event.preventDefault();
    };

    onDragLeave = (event) => {
        event.preventDefault();

        this.setState({
            isDragActive: false,
            isDragReject: false
        });

        if(event.pageX==0){
            this.setState({showDropZone:false});
        }

        if (this.props.onDragLeave) {
            this.props.onDragLeave(event);
        }
    };

    onDrop = (event) => {
        event.preventDefault();
        this.captureFile(event)
    };

    onPaste = (event) => {
        return;
        if(!this.props.disablePaste){
            this.setState({showDropZone:true});
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;

            let files = [];
            let index = 0;
            for (index in items) {
                var item = items[index];
                if (item.kind === 'file') {
                    var blob = item.getAsFile();
                    blob.lastModifiedDate = new Date();
                    blob.name = "image-"+new Date()+".jpg";
                    blob.type = "image/jpeg";
                    let file = new File([blob], blob.name);
                    files.push(file);
                }
            }
            if(files.length){
                this.captureFile(event, files);
            }
        }
    };

    captureFile = (event, fileList) => {
        this.setState({
            isDragActive: false,
            isDragReject: false,
            showDropZone: false,
        });

        let files = fileList ? fileList : (event.dataTransfer ? event.dataTransfer.files : event.target.files);

        if (this.props.onDrop) {
            this.props.onDrop(files, event);
        }

        if (this.allFilesAccepted(files)) {
            if (this.props.onDropAccepted) {
                this.props.onDropAccepted(files, event);
            }
        }
        else {
            if (this.props.onDropRejected) {
                this.props.onDropRejected(files, event);
            }
        }
    };

    onClick = () => {
        if (!this.props.disableClick) {
            this.open();
        }
    };

    open = () => {
        let fileInput = React.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    };

    render = () =>{
        if(!this.state.showDropZone){
            return <span/>;
        }

        let className;
        if (this.props.className) {
            className = this.props.className;
            if (this.state.isDragActive) {
                className += ' ' + this.props.activeClassName;
            };
            if (this.state.isDragReject) {
                className += ' ' + this.props.rejectClassName;
            };
        };

        let style, activeStyle;
        if (this.props.style || this.props.activeStyle) {
            if (this.props.style) {
                style = this.props.style;
            }
            if (this.props.activeStyle) {
                activeStyle = this.props.activeStyle;
            }
        }
        else if (!className) {
            style = {
                position:'fixed !important',
                width:'100%',
                height:'100%',
                zIndex: 9999,
                backgroundColor: '#f4f4f4',
                opacity: 0.7,
                border: 'solid 5px #cda54b',
                color:'#cda54b',
                fontSize: '40px',
                padding: '200px',
                textAlign: 'center',
                top: '0',
                bottom: '0',
                right: '0',
                left: '0'
            };
            activeStyle = {
                backgroundColor: 'white',
                color:'black',
            };
        }
        let appliedStyle;
        if (activeStyle && this.state.isDragActive) {
            appliedStyle = {
              ...style,
              ...activeStyle
            };
        }
        else {
            appliedStyle = {
              ...style
            };
        };

        return (
            <div
                className={className}
                style={appliedStyle}
                onClick={this.onClick}
                onDragEnter={this.onDragEnter}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}>
                    {this.props.children || "Drop Files to upload!"}
                    <input
                        type='file'
                        ref='fileInput'
                        style={{ display: 'none' }}
                        multiple={this.props.multiple}
                        accept={this.props.accept}
                        onChange={this.onDrop}/>
            </div>
        );
    }
}

export default Dropzone;
