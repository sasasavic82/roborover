
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
        url: config.control_endpoint,
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
          url: config.control_endpoint,
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
  