var React = require('react');
var accept = require('attr-accept');

var Dropzone = React.createClass({

    getDefaultProps: function() {
        return {
            disableClick: false,
            disablePaste: false,
            multiple: true
        };
    },

    getInitialState: function() {
        return {
            isDragActive: false,
            showDropZone: false,
            showDropZone: false,
        };
    },

    propTypes: {
        onDrop: React.PropTypes.func,
        onPaste: React.PropTypes.func,
        onDropAccepted: React.PropTypes.func,
        onDropRejected: React.PropTypes.func,
        onDragEnter: React.PropTypes.func,
        onDragLeave: React.PropTypes.func,

        style: React.PropTypes.object,
        activeStyle: React.PropTypes.object,
        className: React.PropTypes.string,
        activeClassName: React.PropTypes.string,
        rejectClassName: React.PropTypes.string,

        disableClick: React.PropTypes.bool,
        disablePaste: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        accept: React.PropTypes.string,
    },

    componentDidMount: function() {
        window.addEventListener('dragenter',this.onDragEnter);
        window.addEventListener('dragleave',this.onDragLeave);
        window.addEventListener('dragover',this.onDragOver);
        window.addEventListener('drop',this.onDrop);
        window.addEventListener('paste',this.onPaste);
    },

    componentWillUnmount: function() {
        window.removeEventListener('dragenter', this.onDragEnter);
        window.removeEventListener('dragleave',this.onDragLeave);
        window.removeEventListener('dragover',this.onDragOver);
        window.removeEventListener('drop',this.onDrop);
        window.removeEventListener('paste',this.onPaste);
    },

    allFilesAccepted: function(files) {
        return files.every(file => accept(file, this.props.accept))
    },

    onDragEnter: function(event) {
        event.preventDefault();
        // This is tricky. During the drag even the dataTransfer.files is null
        // But Chrome implements some drag store, which is accesible via dataTransfer.items
        var dataTransferItems = event.dataTransfer && event.dataTransfer.items ? event.dataTransfer.items : [];

        // Now we need to convert the DataTransferList to Array
        var itemsArray = Array.prototype.slice.call(dataTransferItems);
        var allFilesAccepted = this.allFilesAccepted(itemsArray);

        this.setState({
            isDragActive: allFilesAccepted,
            isDragReject: !allFilesAccepted,
            showDropZone: true,
        });

        if (this.props.onDragEnter) {
            this.props.onDragEnter(event);
        }
    },

    onDragOver: function (event) {
        event.preventDefault();
    },

    onDragLeave: function(event) {
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
    },

    onDrop: function(event) {
        event.preventDefault();
        this.captureFile(event)
    },

    onPaste: function(event){
        if(!this.props.disablePaste){
            this.setState({showDropZone:true});
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            var files = [];
            for (index in items) {
                var item = items[index];
                if (item.kind === 'file') {
                    var blob = item.getAsFile();
                    blob.lastModifiedDate = new Date();
                    blob.name = "image-"+new Date()+".jpg";
                    blob.type = "image/jpeg";
                    var file = new File([blob], blob.name);
                    files.push(file);
                }
            }
            if(files.length){
                this.captureFile(event,files);
            }
        }
    },

    captureFile: function(event, files){
        this.setState({
            isDragActive: false,
            isDragReject: false,
            showDropZone: false,
        });

        var droppedFiles = files?files: (event.dataTransfer ? event.dataTransfer.files : event.target.files);
        var max = this.props.multiple ? droppedFiles.length : 1;
        var files = [];

        for (var i = 0; i < max; i++) {
            var file = droppedFiles[i];
            file.preview = URL.createObjectURL(file);
            files.push(file);
        }

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

    },

    onClick: function () {
        if (!this.props.disableClick) {
            this.open();
        }
    },

    open: function() {
        var fileInput = React.findDOMNode(this.refs.fileInput);
        fileInput.value = null;
        fileInput.click();
    },

    render: function() {

        if(!this.state.showDropZone){
            return <span/>;
        }

        var className;
        if (this.props.className) {
            className = this.props.className;
            if (this.state.isDragActive) {
                className += ' ' + this.props.activeClassName;
            };
            if (this.state.isDragReject) {
                className += ' ' + this.props.rejectClassName;
            };
        };

        var style, activeStyle;
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
                position: 'fixed',
                width:'100%',
                height:'100%',
                zIndex: '9999',
                'backgroundColor': 'rgba(0, 0, 0, 0.8)',        
                'color':'white',
                fontSize: '40px',
                padding: '200px',
                textAlign: 'center',
                top: '0',
                bottom: '0',
                right: '0',
                left: '0',

            };
            activeStyle = {
                'backgroundColor': 'white',        
                'color':'black',
            };
        }

        var appliedStyle;
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
                    {this.props.children}
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
});

module.exports = Dropzone;
