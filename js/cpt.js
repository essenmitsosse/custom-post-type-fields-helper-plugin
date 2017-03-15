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

		if ( $.fn.datepicker ) {
			// Setup Datepicker
			$dateInputs.datepicker( {
				dateFormat: "dd.mm.yy",
				showOn: "focus",
				numberOfMonths: 1,
				regional: "de"
			} );
		}
	}

	function getYoutubeCodeFromUrl( input ) {
		var youtubeCode;

		if ( input.length === 11 ) {
			return input;
		}

		youtubeCode = input.match( /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/ );

		return ( youtubeCode && youtubeCode[ 7 ].length === 11 ) ? youtubeCode[ 7 ] : "";
	}

	function setPreviewImageSrc( $imageFrame, url ) {
		$imageFrame.attr( "src", url );
	}

	function getVimeoCodeFromUrl( input ) {
		var vimeoCode;

		vimeoCode = input.match( /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/ );

		return vimeoCode[ 3 ];
	}

	function setYoutubePreviewImageUrlFromVideoCode( $imageFrame, videoCode ) {
		if ( videoCode ) {
			setPreviewImageSrc( $imageFrame, "http://img.youtube.com/vi/" + videoCode + "/0.jpg" );
		}
	}

	function setVimeoPreviewImageUrlFromVideoCode( $imageFrame, videoCode ) {
		if ( !videoCode ) {
			return;
		}

		$.ajax( {
			type: "GET",
			url: "http://vimeo.com/api/v2/video/" + videoCode + ".json",
			jsonp: "callback",
			dataType: "jsonp",
			success: function ( data ) {
				/* jshint -W106 */
				if ( data && data[ 0 ] && data[ 0 ].thumbnail_medium ) {
					setPreviewImageSrc( $imageFrame, data[ 0 ].thumbnail_medium );
				}
				/* jshint +W106 */
			}
		} );
	}

	function getYoutubeUrlFromCode( videoCode ) {
		return videoCode === "" ? "" : "http://youtube.com/watch?v=" + videoCode;
	}

	function getVimeoUrlFromCode( videoCode ) {
		return videoCode === "" ? "" : "https://vimeo.com/" + videoCode;
	}

	var setupElementAdders = ( function () {
		function FieldPrototype( data, parent ) {
			this.name = data.name;
			this.niceName = data[ [ "nice", "name" ].join( "_" ) ];
			this.parent = parent;
			this.fullName = this.name + "_" + this.parent.name;
			this.type = data.type;

			this.hasLabel = true;

			switch ( this.type ) {
			case "textarea":
				this.getInputElement = this.getInputElementTextarea;
				break;
			case "video":
				this.getInputElement = this.getInputElementVideo;
				this.getVideoCodeFromUrl = getYoutubeCodeFromUrl;
				this.getVideoUrlFromCode = getYoutubeUrlFromCode;
				this.setVideoPreviewImageFromCode = setYoutubePreviewImageUrlFromVideoCode;
				break;
			case "vimeo-video":
				this.getInputElement = this.getInputElementVideo;
				this.getVideoCodeFromUrl = getVimeoCodeFromUrl;
				this.getVideoUrlFromCode = getVimeoUrlFromCode;
				this.setVideoPreviewImageFromCode = setVimeoPreviewImageUrlFromVideoCode;
				break;
			case "media":
				this.getInputElement = this.getInputElementMedia;
				this.hasLabel = false;
				break;
			case "media-preview":
				this.getInputElement = this.getInputElementMediaPreview;
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
				$input = this.getInputElement( value ),
				$wrapper = $( "<div>", {
					"class": "cptea-single-input-wrapper"
				} );

			if ( this.hasLabel ) {
				$wrapper.append( $label );
			}

			$wrapper.append( $input );

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
					"class": "cptea-single-input-media-wrapper"
				} ),
				$urlSaver = $( "<input>", {
					"name": this.fullName,
					"value": value,
					"type": "hidden",
					"class": "cptea-single-important-input cpt-single-input-video-url"
				} ),
				$input = $( "<input>", {
					"class": "cptea-single-input cptea-single-input-video",
					"value": this.getVideoUrlFromCode( value )
				} ),
				$imageFrame = $( "<img>", {
					"class": "cptea-media-field"
				} ),
				inputDom = $input[ 0 ];

			this.setVideoPreviewImageFromCode( $imageFrame, value );

			inputDom.$hiddenInputField = $urlSaver;
			inputDom.$imageFrame = $imageFrame;
			inputDom.object = this;

			$wrapper.append( $urlSaver, $input, $imageFrame );

			return $wrapper;
		};

		FieldPrototype.prototype.getInputElementMedia = function ( value ) {
			var $idSaver = $( "<input>", {
				"name": this.fullName,
				"value": value,
				"type": "hidden",
				"class": "cptea-single-important-input"
			} );

			return $idSaver;
		};

		FieldPrototype.prototype.getInputElementMediaPreview = function ( value ) {
			var valueObject = typeof value === "string" ? JSON.parse( value ) : value,
				$imageFrame = $( "<img>", {
					"class": "cptea-media-field",
					"src": valueObject.thumbnail.url
				} ),
				$idSaver = $( "<input>", {
					"name": this.fullName,
					"value": "!" + JSON.stringify( valueObject ),
					"type": "hidden",
					"class": "cptea-single-important-input"
				} ),
				$wrapper = $( "<div>", {
					"class": "cptea-single-input-media-wrapper"
				} );

			console.log( valueObject );

			$wrapper.append( $imageFrame, $idSaver );

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
					"html": "add " + this.niceName
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

			console.log( attachment );

			attachment.forEach( this.addMedia.bind( this ) );

			this.parent.update();
		};

		AdderObject.prototype.addMedia = function ( attachment ) {
			var data = {
				"datatype": this.type
			};

			data[ "id_" + this.name ] = attachment.id;
			data[ "srcs_" + this.name ] = attachment.sizes;

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
					"update": this.update.bind( this ),
					"forcePlaceholderSize": true
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

		ElementAdder.prototype.parseVideoUrl = function ( event ) {
			var target = event.target || event.currentTarget,
				$target = $( target ),
				$hiddenInputField = target.$hiddenInputField,
				$imageFrame = target.$imageFrame,
				object = target.object,
				videoCode = object.getVideoCodeFromUrl( $target.val() );

			$target.val( object.getVideoUrlFromCode( videoCode ) );
			$hiddenInputField.val( videoCode );
			object.setVideoPreviewImageFromCode( $imageFrame, videoCode );

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
					var $item = $( item ),
						value = $item.val();

					/* If value is marked with an "!" it’s a JSON string.
					 * We need to parse it first, so we don’t double stringify it.
					 */
					if ( value[ 0 ] === "!" ) {
						value = JSON.parse( value.substring( 1 ) );
					}

					itemData[ $item.attr( "name" ) ] = value;
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
} )( jQuery );;
