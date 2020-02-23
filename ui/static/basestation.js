var baseUrl = 'https://q0lh864dc2.execute-api.us-east-1.amazonaws.com/dev/api/';

var commands = {
  type: 'commands',
  attributes: []
};

$(document).ready(function() {
    $("#forward_button").click(function(e) {
      console.log(e);
      e.preventDefault();
      $.ajax({
        type: "POST",
        data: JSON.stringify({
            "type": "forward",
            "attributes": {
                "delay": 2000
            }
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: baseUrl + 'control',
        success: function(result) {
          console.log(result);
          $( ".output" ).text(result);
        },
        error: function(result) {
          console.log('error', result);
          $(".error").text(result.error);
        }
      });
    });

    $("#stop_button").click(function(e) {
        console.log(e);
        e.preventDefault();
        $.ajax({
          type: "POST",
          data: JSON.stringify({
              "type": "stop"
          }),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          url: baseUrl + 'control',
          success: function(result) {
            console.log(result);
            $( ".output" ).text(result);
          },
          error: function(result) {
            console.log('error', result);
            $(".error").text(result.error);
          }
        });
      });

  })
  