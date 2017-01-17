<?php
/**
 * Plugin Name: CPT Plugin
 * Description: Class that gets meta data for display on the backend
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
 * CPT Meta Getter
 *
 * The Meta Getter gets meta information from an array of all meta information
 * or return "null" if no value can be found
 *
 * @class       CPT_Meta_Getter
 * @version     0.0.1
 * @package     CPT
 * @category    Class
 * @author      essenmitsosse
 */
class CPT_Meta_Getter {

	/**
	 * List of meta information.
	 *
	 * @var array
	 */
	public static $meta_information;

	/**
	 * CPT_MetaGetter Constructor.
	 *
	 * @param number $id Id of the post.
	 */
	public function __construct( $id = false ) {
		global $post;

		self::$meta_information = get_post_custom( $id ? $id : $post->ID );
	}

	/**
	 * Outputs a Nonce
	 */
	public static function get_nonce() {
		global $post_type;
		echo '<input type="hidden" name="' . $post_type . '_meta_nonce" id="' . $post_type . '_meta_nonce" value="' .
		wp_create_nonce( $post_type . '_meta_nonce' ) . '" />';
	}

	/**
	 * Gets meta data with a given name
	 *
	 * @param string $meta_name Name of the meta value that should be gotten.
	 */
	public static function get_meta( $meta_name ) {
		$real_meta_name = '_' . $meta_name;
		return array_key_exists( $real_meta_name, self::$meta_information ) ? self::$meta_information[ $real_meta_name ][0] : null;
	}

	/**
	 * Gets boolean meta data with a given name
	 *
	 * @param string $meta_name Name of the meta value that should be gotten.
	 */
	public static function get_meta_boolean( $meta_name ) {
		$meta_value = self::get_meta( $meta_name );

		return ( false === $meta_value || null === $meta_value || 0 === $meta_value ) ? false : true;
	}
}
