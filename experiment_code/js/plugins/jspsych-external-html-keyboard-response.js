/** (July 2012, Erik Weitnauer)
The html-plugin will load and display an external html pages. To proceed to the next, the
user might either press a button on the page or a specific key. Afterwards, the page get hidden and
the plugin will wait of a specified time before it proceeds.

documentation: docs.jspsych.org
*/

jsPsych.plugins['external-html-keyboard-response'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'external-html-keyboard-resposne',
    description: '',
    parameters: {
      url: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'URL',
        default: undefined,
        description: 'The url of the external html page'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond.'
      },
      one_response: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Only first response',
        default: false,
        description: 'Only the first valid response will be recorded.'
      },
      cont_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Continue key',
        default: null,
        description: 'The key to continue to the next page.'
      },
      cont_btn: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Continue button',
        default: null,
        description: 'The button to continue to the next page.'
      },
      likert: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Likert',
        default: null,
        description: 'Likert options'
      },
      check_fn: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Check function',
        default: function() { return true; },
        description: ''
      },
      force_refresh: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Force refresh',
        default: false,
        description: 'Refresh page.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: false,
        description: 'If true, trial will end when subject makes a response.'
      },
      // if execute_Script == true, then all javascript code on the external page
      // will be executed in the plugin site within your jsPsych test
      execute_script: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Execute scripts',
        default: false,
        description: 'If true, JS scripts on the external html file will be executed.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var url = trial.url;
    if (trial.force_refresh) {
      url = trial.url + "?time=" + (new Date().getTime());
    }

    // store response
    var responses = {
      rts: [],
      keys: []
    };

    var choice = null;

    load(display_element, url, function() {
      var finish = function() {
        if (trial.check_fn && !trial.check_fn(display_element)) { return };
        if (trial.cont_key) { document.removeEventListener('keydown', key_listener); }

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        if (trial.likert) {
          var trial_data = {
            rt: responses.rts,
            key_press: responses.keys,
            url: trial.url,
            choice: choice
          };
        }
        else {
          var trial_data = {
            rt: responses.rts,
            key_press: responses.keys,
            url: trial.url
          };
        }

        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      };

      // by default, scripts on the external page are not executed with XMLHttpRequest().
      // To activate their content through DOM manipulation, we need to relocate all script tags
      if (trial.execute_script) {
        for (const scriptElement of display_element.getElementsByTagName("script")) {
        const relocatedScript = document.createElement("script");
        relocatedScript.text = scriptElement.text;
        scriptElement.parentNode.replaceChild(relocatedScript, scriptElement);
        };
      }

      // function to handle responses by the subject
      var after_response = function(info) {
        responses.rts.push(info.rt);
        responses.keys.push(info.key);
        if (trial.response_ends_trial) {
          finish();
        }
      };

      // start the response listener
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: !trial.one_response,
        allow_held_key: false
      });

      if (trial.cont_btn) {
        display_element.querySelector('#'+trial.cont_btn).addEventListener('click', finish)
      }

      if (trial.likert) {
        display_element.querySelector('#jspsych-survey-likert-form').addEventListener('submit', function(e){
          e.preventDefault();
          var question_data = {};
          var ops = display_element.querySelector('#jspsych-survey-likert-form .jspsych-survey-likert-opts');

          var id = ops.dataset['radioGroup'];
          var el = display_element.querySelector('input[name="' + id + '"]:checked');
          if (el === null) {
            choice = "";
          } else {
            choice = parseInt(el.value);
          }
          finish();
        });
      }

      if (trial.cont_key) {
        var key_listener = function(e) {
          if (e.which == trial.cont_key) finish();
        };
        display_element.addEventListener('keydown', key_listener);
      }
    });
  };

  // helper to load via XMLHttpRequest
  function load(element, file, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file, true);
    if (file.indexOf('=') > -1){
      id = file.split('=')[1]
      set_up_flag = file.split('=')[2]
      xmlhttp.onload = function(){
          if(xmlhttp.status == 200 || xmlhttp.status == 0){ //Check if loaded
              element.innerHTML = xmlhttp.responseText.replace('+ id +', '+ ' + id + ' +');
              element.innerHTML = xmlhttp.responseText.replace('setupflag', set_up_flag);
              callback();
          }
      }
    }
    else{
      xmlhttp.onload = function(){
          if(xmlhttp.status == 200 || xmlhttp.status == 0){ //Check if loaded
              element.innerHTML = xmlhttp.responseText;
              callback();
          }
      }
    }
    xmlhttp.send();
  }

  return plugin;
})();
