<?php
/**
 * Plugin Name: CPT Plugin
 * Description: Script and Style Helper methods to create inputs.
 * Version:	 0.0.1
 * Author:	  Marcus Blättermann
 * Author URI:  http://essenmitsosse.de
 * Domain Path: /lang
 * Text Domain: cpt-events
 *
 * @category Core
 *
 * @package Wordpress
 * @author essenmitsosse
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * CPT Meta Script and Style Helper
 *
 * The Meta Script and Style Helper offers helper methods to create inputs.
 *
 * @class       CPT_Meta_Script_Style_Helper
 * @version     0.0.1
 * @package     CPT
 * @category    Class
 * @author      essenmitsosse
 */
class CPT_Meta_Script_Style_Helper {

	/**
	 * CPT_MetaScript and Style Helper Constructor.
	 *
	 * @param array $dependencies List of the scripts and styles that are required.
	 */
	public function __construct( $dependencies ) {
		$plugin_url = Custom_Post_Types::$plugin_url . '/';

		wp_enqueue_media();

		// jQuery UI.
		if ( in_array( 'ui-datepicker', $dependencies, true ) ) {
			// Scripts.
			wp_enqueue_script(
				'jquery-ui',
				$plugin_url . 'bower_components/jquery-ui/jquery-ui.min.js',
				array( 'jquery' )
			);
			wp_enqueue_script(
				'ui-datepicker',
				$plugin_url . 'bower_components/jquery-ui/ui/widgets/datepicker.js',
				array( 'jquery-ui' )
			);
			wp_enqueue_script(
				'ui-datepicker-de',
				$plugin_url . 'bower_components/jquery-ui/ui/i18n/datepicker-de.js',
				array( 'ui-datepicker' )
			);

			// Styles.
			wp_enqueue_style( 'ui-core',  $plugin_url . 'bower_components/jquery-ui/themes/base/jquery-ui.min.css' );
		}

		// General Scripts.
		wp_enqueue_script(
			'cpt-script',
			$plugin_url . 'js/cpt.js',
			array( 'jquery' ),
			'0.0.5'
		);

		// General Styles.
		wp_enqueue_style( 'custom-post-type-admin', $plugin_url . 'css/cpt.css' );
	}
}
