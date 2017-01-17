( function ( $ ) {
	"use strict";
	$( function () {
		var $dateInputs = $( ".cpt-input-date" );

		// Setup Datepicker
		$dateInputs.datepicker( {
			dateFormat: "dd.mm.yy",
			showOn: "focus",
			numberOfMonths: 1,
			regional: "de"
		} );
	} );
} )( jQuery );
