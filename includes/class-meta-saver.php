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
 * CPT Meta Saver
 *
 * The Meta saver saves all the meta information
 *
 * @class       CPT_Meta_Saver
 * @version     0.0.1
 * @package     CPT
 * @category    Class
 * @author      essenmitsosse
 */
class CPT_Meta_Saver {

	/**
	 * List of meta information.
	 *
	 * @var array
	 */
	public static $meta_information = array();

	/**
	 * CPTMeta_Saver Constructor.
	 *
	 * @param number       $post_id Post Id.
	 * @param post         $post    Post Object.
	 * @param string/array $collect_all_meta_information_callback Name of the callback function.
	 */
	public function __construct( $post_id, $post, $collect_all_meta_information_callback ) {
		/*
		 * Verify this came from the our screen and with proper authorization,
		 * because save_post can be triggered at other times.
		 */
		if ( self::check_if_something_is_wrong( $post ) ) {
			return $post->ID;
		}

		call_user_func( $collect_all_meta_information_callback, $this );

		self::save_meta_information( $post->ID );
	}

	/**
	 * Adds a boolean value to the collection.
	 *
	 * @param string $meta_name Name of the meta value.
	 */
	public static function add_meta_value_boolean( $meta_name ) {
		if ( array_key_exists( $meta_name, $_POST ) ) {
			$value = true;
		} else {
			$value = false;
		}

		self::add_specific_meta_value( $meta_name, $value, true );
	}

	/**
	 * Adds a meta info to the collection.
	 *
	 * @param string $meta_name Name of the meta value.
	 */
	public static function add_meta_value( $meta_name ) {
		if ( array_key_exists( $meta_name, $_POST ) ) {
			$value = $_POST[ $meta_name ];
		} else {
			$value = false;
		}

		self::add_specific_meta_value( $meta_name, $value );
	}

	/**
	 * Adds a meta info with a specific value to the collection.
	 *
	 * @param string $meta_name Name of the meta value.
	 * @param number $date_name Name of the value for the date.
	 * @param number $time_name Name of the value for the time.
	 */
	public static function add_date_time( $meta_name, $date_name, $time_name ) {
		$date = self::get_value_from_post( $date_name );
		$time = self::get_value_from_post( $time_name, '00:00' );

		$datetime = DateTime::createFromFormat(
			'd.m.Y H:i',
			$date . ' ' . $time
		)->format( 'U' );

		self::add_specific_meta_value( $meta_name, $datetime );
	}

	/**
	 * Takes the end of the last day and saves it.
	 *
	 * @param string $meta_name  Name of the meta value.
	 * @param array  $date_infos List of the names of the dates and if they should be used.
	 */
	public static function add_end_of_last_day( $meta_name, $date_infos ) {
		$last_date = 0;

		foreach ( $date_infos as $date_info ) {
			if (  true === $date_info[1] || 'on' === self::get_value_from_post( $date_info[1] ) ) {
				$current_date = self::get_value_from_post( $date_info[0] );
				if ( $current_date > $last_date ) {
					$last_date = $current_date;
				}
			}
		}

		$end_of_last_day = DateTime::createFromFormat(
			'd.m.Y H:i',
			$last_date . ' 23:59'
		)->format( 'U' );

		self::add_specific_meta_value( $meta_name, $end_of_last_day );
	}

	/**
	 * Adds a meta info with a specific value to the collection.
	 *
	 * @param string                $meta_name Name of the meta value.
	 * @param string/number/boolean $value     Value for a given meta.
	 * @param boolean|false         $force     If the saving of the value should be forced (used for boolen values).
	 */
	public static function add_specific_meta_value( $meta_name, $value, $force = false ) {
		if ( false !== $value || true === $force ) {
			self::$meta_information[ '_' . $meta_name ] = $value;
		}
	}

	/**
	 * Saves the meta data for the event we are currently on.
	 *
	 * @param post $post The post.
	 */
	public function check_if_something_is_wrong( $post ) {
		if ( ! (
			isset( $_POST['event_meta_nonce'] ) &&
			wp_verify_nonce( wp_unslash( $_POST['event_meta_nonce'] ), 'event_meta_nonce' )
		) ) {
			return true;
		}

		// Is the user allowed to edit the post or page?
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return true;
		}

		global $post_type;

		// Are we on a post of the right type?
		if ( ! ( 'event' === $post_type ) ) {
			return true;
		}

		// Don't store custom data twice.
		if ( 'revision' === $post->post_type ) {
			return true;
		}

		return false;
	}

	/**
	 * Saves every single meta information from an array to the database
	 *
	 * @param number $id               Post Id.
	 */
	public function save_meta_information( $id ) {
		foreach ( self::$meta_information as $key => $value ) {

			// If $value is an array, make it a CSV ( unlikely ).
			$value = implode( ',', (array) $value );

			// If the custom field already has a value.
			if ( get_post_meta( $id, $key, false ) ) {
				update_post_meta( $id, $key, $value );
			} else { // If the custom field doesn't have a value.
				add_post_meta( $id, $key, $value );
			}

			// Delete if blank.
			if ( ! $value ) {
				delete_post_meta( $id, $key );
			}
		}
	}

	/**
	 * Gets a value from the $_POST information.
	 *
	 * @param string                $value_name Name of the value.
	 * @param string/number/boolean $default    Default value.
	 */
	public static function get_value_from_post( $value_name, $default = false ) {
		if ( array_key_exists( $value_name, $_POST ) ) {
			return $_POST[ $value_name ];
		} else {
			return $default;
		}
	}
}
