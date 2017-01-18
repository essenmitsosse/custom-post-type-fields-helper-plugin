( function ( $ ) {
	"use strict";
	var mediaObject = {
		title: "Select images to be added to this gallery",
		button: {
			text: "Add image to gallery"
		},
		multiple: true // Set to true to allow multiple files to be selected
	};

	function loopThroughArrayAndAddToObject( inputArray, outputObject, outputList, ConstructorFunction, parent, fieldName ) {
		inputArray.forEach(
			function ( element ) {
				var newElement = new ConstructorFunction( element, parent );
				outputObject[ element[ fieldName ] ] = newElement;
				outputList.push( newElement );
			}
		);
	}

	function setupDateInputs() {
		var $dateInputs = $( ".cpt-input-date" );

		// Setup Datepicker
		$dateInputs.datepicker( {
			dateFormat: "dd.mm.yy",
			showOn: "focus",
			numberOfMonths: 1,
			regional: "de"
		} );
	}

	function getYoutubeCode( input ) {
		var youtubeCode;

		if ( input.length === 11 ) {
			return input;
		}

		youtubeCode = input.match( /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/ );

		return ( youtubeCode && youtubeCode[ 7 ].length === 11 ) ? youtubeCode[ 7 ] : "";
	}

	function getYoutubePreviewImageUrl( videoCode ) {
		return "http://img.youtube.com/vi/" + videoCode + "/0.jpg";
	}

	function getYoutubeUrl( videoCode ) {
		return videoCode === "" ? "" : "http://youtube.com/watch?v=" + videoCode;
	}

	var setupElementAdders = ( function () {
		function FieldPrototype( data, parent ) {
			this.name = data.name;
			this.niceName = data[ [ "nice", "name" ].join( "_" ) ];
			this.parent = parent;
			this.fullName = this.name + "_" + this.parent.name;
			this.type = data.type;

			switch ( this.type ) {
			case "textarea":
				this.getInputElement = this.getInputElementTextarea;
				break;
			case "video":
				this.getInputElement = this.getInputElementVideo;
				break;
			case "media":
				this.getInputElement = this.getInputElementMedia;
				break;
			default:
				this.getInputElement = this.getInputElementText;
				break;
			}
		}

		FieldPrototype.prototype.getJQueryObject = function ( data ) {
			var value = data[ this.fullName ] || "",
				$label = $( "<label>", {
					"html": this.niceName + ":",
					"for": this.fullName,
					"class": "cptea-label"
				} ),
				$input = this.getInputElement( value, data ),
				$wrapper = $( "<div>", {
					"class": "cptea-single-input-wrapper"
				} )
				.append( $label, $input );

			return $wrapper;
		};

		FieldPrototype.prototype.getInputElementText = function ( value ) {
			return $( "<input>", {
				"name": this.fullName,
				"class": "cptea-single-input cptea-single-important-input",
				"value": value
			} );
		};

		FieldPrototype.prototype.getInputElementTextarea = function ( value ) {
			return $( "<textarea>", {
				"name": this.fullName,
				"class": "cptea-single-input cptea-single-important-input cptea-single-input-textarea",
				"html": value
			} );
		};

		FieldPrototype.prototype.getInputElementVideo = function ( value ) {
			var $wrapper = $( "<div>", {
					"class": "cptea-single-input-wrapper-inner-video"
				} ),
				$urlSaver = $( "<input>", {
					"name": this.fullName,
					"value": value,
					"type": "hidden",
					"class": "cptea-single-important-input"
				} ),
				$input = $( "<input>", {
					"class": "cptea-single-input cptea-single-input-video",
					"value": getYoutubeUrl( value )
				} ),
				$imageFrame = $( "<img>", {
					"class": "cptea-video-field",
					"src": getYoutubePreviewImageUrl( value )
				} );

			$input[ 0 ].$hiddenInputField = $urlSaver;
			$input[ 0 ].$imageFrame = $imageFrame;

			$wrapper.append( $urlSaver, $input, $imageFrame );

			return $wrapper;
		};

		FieldPrototype.prototype.getInputElementMedia = function ( value, data ) {
			var $wrapper = $( "<div>", {
					"class": "cptea-single-input-wrapper-inner-video"
				} ),
				$idSaver = $( "<input>", {
					"name": this.fullName,
					"value": data.media.id,
					"type": "hidden",
					"class": "cptea-single-important-input"
				} ),
				$imageurl = $( "<input>", {
					"name": this.fullName,
					"value": data.media.src,
					"type": "hidden",
					"class": "cptea-single-important-input"
				} ),
				$imageFrame = $( "<img>", {
					"class": "cptea-video-field",
					"src": data.media.src
				} );

			console.log( this.fullName );

			$wrapper.append( $idSaver, $imageurl, $imageFrame );

			return $wrapper;
		};

		function AdderObject( data, parent ) {
			this.name = data.name;
			this.niceName = data[ [ "nice", "name" ].join( "_" ) ];
			this.fields = {};
			this.fieldsList = [];
			this.parent = parent;
			this.fullName = this.name + "_" + this.parent.name;
			this.type = data.type || "regular";

			if ( this.type === "media" ) {
				this.frame = window.wp.media( mediaObject );
				this.frame.on( "select", this.mediaHasBeenSelected.bind( this ) );

				this.onButtonClick = this.onMediaButtonClick;
			}

			if ( data.fields ) {
				loopThroughArrayAndAddToObject( data.fields, this.fields, this.fieldsList, FieldPrototype, this, "name" );
			}

			this.createButton();
		}

		AdderObject.prototype.createButton = function () {
			this.button = $( "<button>", {
					"class": "cpt-object-add-button",
					"html": "+" + this.niceName
				} )
				.on( "click", this.onButtonClick.bind( this ) );

			this.parent.addButton( this.button );
		};

		AdderObject.prototype.onButtonClick = function ( event ) {
			event.preventDefault();

			this.addElementFromData( {} );
		};

		AdderObject.prototype.onMediaButtonClick = function ( event ) {
			event.preventDefault();

			if ( this.frame ) {
				this.frame.open();
			}
		};

		AdderObject.prototype.mediaHasBeenSelected = function () {
			var attachment = this.frame.state()
				.get( "selection" )
				.toJSON();

			attachment.forEach( this.addMedia.bind( this ) );

			this.parent.update();
		};

		AdderObject.prototype.addMedia = function ( attachment ) {
			var data = {
				"datatype": this.type,
				"media": {
					"id": attachment.id,
					"src": attachment.url
				}
			};

			this.addElementFromData( data );
		};

		AdderObject.prototype.addElementFromData = function ( data ) {
			var $newElement = $( "<li>", {
					"class": "cptea-list-item",
					"data-name": this.name
				} ),
				$fieldListWrapper = $( "<div>", {
					"class": "cptea-inputs-wrapper"
				} ),
				$closeButton = $( "<button>", {
					"html": "×",
					"class": "cptea-close"
				} );

			$closeButton[ 0 ].$parentRef = $newElement;

			$newElement.append( $closeButton, $fieldListWrapper );

			$newElement.ref = this;

			this.fieldsList.reduce( this.addField, {
				"$fieldListWrapper": $fieldListWrapper,
				data: data
			} );

			this.parent.addToList( $newElement );
		};

		AdderObject.prototype.addField = function ( object, currentField ) {
			object.$fieldListWrapper.append( currentField.getJQueryObject( object.data ) );
			return object;
		};

		function ElementAdder( element ) {
			this.element = element;
			this.$element = $( element );
			this.$valueField = this.$element.find( "[name=" + this.$element.data( "value-field" ) + "]" );
			this.$buttonWrapper = $( "<div>", {
					"class": "cptea-button-wrapper"
				} )
				.appendTo( this.$element );
			this.$list = $( "<ul>", {
					"class": "cptea-list"
				} )
				.sortable( {
					"update": this.update.bind( this )
				} )
				.appendTo( this.$element );

			this.$element
				.on( "click", ".cptea-close", this.removeElement.bind( this ) )
				.on( "change", ".cptea-single-important-input", this.update.bind( this ) )
				.on( "change", ".cptea-single-input-video", this.parseVideoUrl.bind( this ) );

			this.getStructure();

			this.parseData( this.getData() );
		}

		ElementAdder.prototype.getStructure = function () {
			var structureJSON = this.$element.data( "structure" );
			this.objects = {};
			this.objectsList = [];
			this.name = structureJSON.name;
			this.niceName = structureJSON[ [ "nice", "name" ].join( "_" ) ];

			loopThroughArrayAndAddToObject( structureJSON.objects, this.objects, this.objectsList, AdderObject, this, "name" );
		};

		ElementAdder.prototype.getData = function () {
			var dataString = this.$valueField.val();

			// Check if there is any data to be parsed.
			if ( dataString === "" ) {
				return false;
			}

			return JSON.parse( dataString );
		};

		ElementAdder.prototype.addElementFromData = function ( data ) {
			var dataType = data.dataType,
				object = this.objects[ dataType ];

			object.addElementFromData( data );
		};

		ElementAdder.prototype.parseData = function ( data ) {
			if ( data === false ) {
				return;
			}

			data.forEach( this.addElementFromData.bind( this ) );
		};

		ElementAdder.prototype.addButton = function ( $button ) {
			this.$buttonWrapper.append( $button );
		};

		ElementAdder.prototype.addToList = function ( $listItem ) {
			this.$list.append( $listItem );
			this.update();
		};

		ElementAdder.prototype.parseVideoUrl = function () {
			var target = event.target || event.currentTarget,
				$target = $( target ),
				$hiddenInputField = target.$hiddenInputField,
				$imageFrame = target.$imageFrame,
				videoCode = getYoutubeCode( $target.val() );

			$target.val( getYoutubeUrl( videoCode ) );
			$hiddenInputField.val( videoCode );
			$imageFrame.attr( "src", getYoutubePreviewImageUrl( videoCode ) );

			this.update();
		};

		ElementAdder.prototype.removeElement = function ( event ) {
			event.preventDefault();
			var target = event.target || event.currentTarget,
				$listItem = target.$parentRef;

			$listItem.remove();

			this.update();
		};

		ElementAdder.prototype.update = function () {
			var $items = this.$list.find( "li" ),
				data = [];

			$items.each( function ( nr, item ) {
				var $item = $( item ),
					$inputs = $item.find( ".cptea-single-important-input" ),
					itemData = {
						"dataType": $item.data( "name" )
					};

				data.push( itemData );

				$inputs.each( function ( nr, item ) {
					var $item = $( item );

					itemData[ $item.attr( "name" ) ] = $item.val();
				} );

			} );

			this.$valueField.val( JSON.stringify( data ) );
		};

		return function () {
			var $elementAdder = $( ".cptea" );

			$elementAdder.each( function createElementAdder( nr, element ) {
				return new ElementAdder( element );
			} );
		};
	} )();

	$( function () {
		setupDateInputs();
		setupElementAdders();
	} );
} )( jQuery );
