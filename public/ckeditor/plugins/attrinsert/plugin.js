CKEDITOR.plugins.add('attrinsert',
{
	requires : ['richcombo'],
	init : function( editor )
	{
		//  array of placeholders to choose from that'll be inserted into the editor
		var attributes = [];
		
		// init the default config - empty attributes
		var defaultConfig = {
			format: '[[%placeholder%]]',
			attributes : []
		};

		// merge defaults with the passed in items		
		var config = CKEDITOR.tools.extend(defaultConfig, editor.config.attrinsert || {}, true);

		console.log('sss',config);

		// run through an create the set of items to use
		for (var i = 0; i < config.attributes.length; i++) {
			// get our potentially custom placeholder format
			var placeholder = config.format.replace('%placeholder%', config.attributes[i]);			
			attributes.push([placeholder, config.attributes[i], config.attributes[i]]);
		}

		// add the menu to the editor
		editor.ui.addRichCombo('attrinsert',
		{
			label: 		'Insert attribute',
			title: 		'Insert attribute',
			voiceLabel: 'Insert attribute',
			className: 	'cke_format',
			multiSelect:false,
			panel:
			{
				css: [ editor.config.contentsCss, CKEDITOR.skin.getPath('editor') ],
				voiceLabel: editor.lang.panelVoiceLabel
			},

			init: function()
			{
				this.startGroup( "Insert attribute" );
				for (var i in attributes)
				{
					this.add(attributes[i][0], attributes[i][1], attributes[i][2]);
				}
			},

			onClick: function( value )
			{
				editor.focus();
				editor.fire( 'saveSnapshot' );
				editor.insertHtml(value);
				editor.fire( 'saveSnapshot' );
			}
		});
	}
});