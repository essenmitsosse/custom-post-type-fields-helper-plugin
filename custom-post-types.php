<?php
/**
 * Plugin Name: Custom Post Type (CPT Plugin)
 * Description: Plugin that enables custom post types
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

if ( ! class_exists( 'Custom_Post_Types' ) ) :

	/**
	 * Main Custom_Post_Types Class.
	 *
	 * @class Custom_Post_Types
	 *
	 * @version	0.0.1
	 */
	final class Custom_Post_Types {
		/**
		 * Version.
		 *
		 * @var string
		 */
		public $version = '0.0.1';

		/**
		 * Database version.
		 *
		 * @var string
		 */
		public static $db_version = '0.0.1';

		/**
		 * The single instance of the class.
		 *
		 * @var Custom_Post_Types
		 *
		 * @since 0.0.1
		 */
		protected static $_instance = null;

		/**
		 * Base url for this plugin.
		 *
		 * @var string
		 */
		public static $plugin_url;

		/**
		 * Instance of Meta Getter.
		 *
		 * @var Object
		 */
		public static $meta_getter;

		/**
		 * Instance of Meta Helper.
		 *
		 * @var Object
		 */
		public static $meta_helper;

		/**
		 * Instance of Meta Saver.
		 *
		 * @var Object
		 */
		public static $meta_saver;

		/**
		 * Instance of Meta Script and Style Helper.
		 *
		 * @var Object
		 */
		public static $meta_script_style_helper;

		/**
		 * If meta getter has already been initialized.
		 *
		 * @var boolean
		 */
		public static $meta_getter_init = false;

		/**
		 * Main Instance.
		 *
		 * Ensures only one instance of Custom_Post_Types is loaded or can be loaded.
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		/**
		 * Constructor.
		 */
		public function __construct() {
			$this->init_hooks();
			$this->includes();
		}

		/**
		 * Include required core files used in admin and on the frontend.
		 */
		public function includes() {
			include_once 'includes/class-meta-getter.php';
			include_once 'includes/class-meta-helper.php';
			include_once 'includes/class-meta-saver.php';
			include_once 'includes/class-meta-script-style-helper.php';

			self::$meta_helper = new CPT_Meta_Helper();
		}

		/**
		 * Returns an instance of a Meta Getter.
		 */
		public static function get_meta_getter() {
			if ( false === self::$meta_getter_init ) {
				self::$meta_getter = new CPT_Meta_Getter();
				self::$meta_getter->get_nonce();
				self::$meta_getter_init = true;
			}

			return self::$meta_getter;
		}

		/**
		 * Returns an instance of a Meta Saver.
		 */
		public static function get_meta_saver( $post_id, $post, $collect_all_meta_information_callback ) {
			return new CPT_Meta_Saver( $post_id, $post, $collect_all_meta_information_callback );
		}

		/**
		 * Returns an instance of a Meta Saver.
		 *
		 * @param array $dependencies List of dependencies.
		 */
		public static function set_dependencies( $dependencies ) {
			new CPT_Meta_Script_Style_Helper( $dependencies );
		}

		/**
		 * Hook into actions and filters.
		 *
		 * @since  0.0.1
		 */
		private function init_hooks() {
			self::$plugin_url = plugins_url( '', __FILE__ );
		}
	}

endif;

/**
 * Main instance of Custom_Post_Types.
 *
 * Returns the main instance of Custom_Post_Types to prevent the need to use globals.
 *
 * @since  0.0.1
 *
 * @return Custom_Post_Types
 */
function custom_post_types_plugin() {
	return Custom_Post_Types::instance();
}

// Global for backwards compatibility.
$GLOBALS['custom_post_types_plugin'] = custom_post_types_plugin();
