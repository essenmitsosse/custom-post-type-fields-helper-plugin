<?php
/**
 * Plugin Name: CPT Plugin
 * Description: Helper methods to create inputs.
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
 * CPT Meta Helper
 *
 * The Meta Helper offers helper methods to create inputs.
 *
 * @class       CPT_Meta_Helper
 * @version     0.0.1
 * @package     CPT
 * @category    Class
 * @author      essenmitsosse
 */
class CPT_Meta_Helper {

	/**
	 * CPT_MetaHelper Constructor.
	 */
	public function __construct() {
	}

	/**
	 * Converts an associative array to key value pairs as in an HTML element.
	 *
	 * @param string/boolean $value Value of the current item.
	 * @param string         $key   Key of the current item.
	 */
	public static function convert_to_html_element_values( &$value, $key ) {
		if ( is_string( $value ) ) {
			$value = "$key='$value'";
		} elseif ( is_array( $value ) ) {
			$value = "$key='" . implode( $value, ' ' ) . "'";
		} elseif ( true === $value ) {
			$value = $key;
		} else {
			$value = '';
		}

	}

	/**
	 * Creates a div with the args that are passed and the content
	 *
	 * @param string/array $class_names   String or Array of class names.
	 * @param string/array $inner_content The inner content for that element.
	 */
	public static function create_div( $class_names, $inner_content ) {
		return self::create_element( 'div', array( 'class' => $class_names ), $inner_content );
	}

	/**
	 * Creates an element with the args that are passed
	 *
	 * @param string       $element_name  Name of the HTML element.
	 * @param array        $args          List of element properties.
	 * @param string/array $inner_content The inner content for that element if neccesarry.
	 */
	public static function create_element( $element_name, $args, $inner_content = false ) {
		array_walk( $args, array( 'CPT_Meta_Helper', 'convert_to_html_element_values' ) );
		$properties = implode( $args, ' ' );
		$final_content = "<$element_name $properties >";

		if ( false !== $inner_content ) {
			if ( is_string( $inner_content ) ) {
				$final_content .= $inner_content;
			} elseif ( is_array( $inner_content ) ) {
				$final_content .= implode( $inner_content, "\n" );
			}

			$final_content .= "</$element_name>";
		}

		return $final_content;
	}

	/**
	 * Creates an input field with a label and a checkbox if wanted.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_input_field( $args ) {
		$args = array_merge(
			array(
				'has_checkbox' => false,
				'checkbox_value' => false,
				'text_area' => false,
				'class' => array(),
			),
			$args
		);

		$input_name = $args['name'];
		if ( array_key_exists( 'desc', $args ) && is_string( $args['desc'] ) && strlen( $args['desc'] ) > 0 ) {
			$input_name .= '_' . $args['desc'];
		}

		// Content.
		$content = array();
		// Label.
		$content[] = self::create_label( array_merge( $args, array(
			'input_name' => $input_name,
		) ) );

		if ( $args['text_area'] ) {
			$content[] = self::create_element(
				'textarea',
				array(
					'class' => array_merge( array( 'cpt-input', 'cpt-textarea', 'cpt-input-content' ), $args['class'] ),
					'name' => $input_name,
				),
			 	$args['value']
			);
		} else {
			$content[] = self::create_element( 'input', array(
				'class' => array_merge( array( 'cpt-input', 'cpt-input-content' ), $args['class'] ),
				'value' => $args['value'],
				'name' => $input_name,
			) );
		}

		// Wrapper.
		$wrapper = self::create_div( 'cpt-input-wrapper', $content );

		return $wrapper;
	}

	/**
	 * Creates a hidden input field with the given values.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_hidden_input_field( $args ) {
		return self::create_element( 'input', array(
			'value' => $args['value'],
			'name' => $args['name'],
			'type' => 'hidden',
		) );
	}

	/**
	 * Creates a label field.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_label( $args ) {
		$args = array_merge( array(
			'has_checkbox' => false,
			'checkbox_value' => false,
			'is_heading' => false,
		), $args );

		// Content.
		$content = array();

		// Checkbox if necessary.
		if ( $args['has_checkbox'] ) {
			$content[] = self::create_checkbox( array_merge( $args, array(
				'input_name' => $args['input_name'],
			) ) );
		}

		// Label/Heading.
		$content[] = self::create_element(
			$args['is_heading'] ? 'h4' : 'label',
			array(
				'class' => 'cpt-label',
				'for' => $args['has_checkbox'] ? $args['input_name'] . ( $args['has_checkbox'] ? '_bool' : '' ) : false,
			),
			$args['nice_name']
		);

		// Wrapper.
		$wrapper_classes = array( 'cpt-label-wrapper' );
		if ( true === $args['is_heading'] ) {
			$wrapper_classes[] = 'cpt-heading-label-wrapper';
		}
		$wrapper = self::create_div( $wrapper_classes, $content );

		return $wrapper;
	}

	/**
	 * Creates a checkbox field.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_checkbox( $args ) {
		return self::create_element(
			'input',
			array(
				'class' => 'cpt-checkbox',
				'name' => $args['input_name'] . '_bool',
				'type' => 'checkbox',
				'checked' => $args['checkbox_value'],
			)
		);
	}

	/**
	 * Creates a date are for a given time with a given name.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_date_field( $args ) {
		$args = array_merge( array(
			'has_time' => false,
			'has_checkbox' => false,
			'checkbox_value' => false,
			'has_time' => false,
		), $args );

		if ( null === $args['date'] ) {
			$args['date'] = time();
			$args['time'] = 0;
		} else {
			$args['time'] = $args['date'];
		}

		// - convert to pretty formats -
		$args['date'] = date( 'd.m.Y', $args['date'] );
		$args['time'] = date( 'H:i', $args['time'] );

		// Datetime.
		$date_time = array(
			self::create_input_field( array_merge( $args, array(
				'desc' => 'date',
				'nice_name' => _x( 'Date', 'even meta title', 'cpt-event' ),
				'value' => $args['date'],
				'has_checkbox' => false,
				'class' => array( 'cpt-input-date' ),
			) ) ),
		);

		if ( false === $args['has_time'] ) {
			$date_time[] = self::create_input_field( array_merge( $args, array(
				'desc' => 'time',
				'nice_name' => _x( 'Time', 'even meta title', 'cpt-event' ),
				'value' => $args['time'],
				'has_checkbox' => true,
				'checkbox_value' => $args['has_time'],
			) ) );
		}

		$date_time_wrapper = self::create_div( array( 'cpt-datetime-input-wrapper', 'cpt-input-content' ), $date_time );

		// Content.
		$content = array();
		// Label.
		$content[] = self::create_label( array_merge( $args, array(
			'is_heading' => true,
			'input_name' => $args['name'] . '_datetime',
		) ) );
		$content[] = $date_time_wrapper;

		// Wrapper.
		$wrapper = self::create_div( array( 'cpt-datetime-wrapper', 'cpt-box' ), $content );
		return $wrapper;
	}

	/**
	 * Creates an element adder, that lets you add an arbatary number of fields with a custom structure.
	 *
	 * @param array $args List of parameters for this function.
	 */
	public static function create_element_adder( $args ) {
		// Content.
		$content = array();
		// Label.
		$content[] = self::create_label( array_merge( $args, array(
			'is_heading' => true,
		) ) );

		$data_field = self::create_hidden_input_field(  array_merge( $args, array(
			'class' => array( 'cptea-data' ),
		) ) );

		$content[] = self::create_element(
			'div',
			array(
				'class' => array( 'cptea' ),
				'data-value-field' => $args['name'],
				'data-structure' => wp_json_encode( array_merge( $args, array( 'value' => null ) ) ),
			),
			array( $data_field )
		);

		// Wrapper.
		$wrapper = self::create_div( array( 'cptea-wrapper' ), $content );
		return $wrapper;
	}
}
