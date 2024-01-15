$(document).ready(function () {
  $(document).on("click", ".add-row", function () {
    var clonedRow = $(".form-group.row:first").clone();

    $(".form-group.row:last .add-row").hide();
    clonedRow.find(".add-row").show();
    clonedRow.find("textarea").val("");
    clonedRow.find("select").val("default");
    $("#customerForm").append(clonedRow);
  });

  $(".generate-btn").click((e) => {
    e.preventDefault();
    $("#postResultDiv").empty();

    var loaderHtml = '<div id="audioLoader" class="loader"></div>';
    $("#postResultDiv").append(loaderHtml);

    ajaxPost();
  });
});

function ajaxPost() {
  var formData = [];
  $(".form-group.row").each(function () {
    var text = $(this).find("textarea").val();
    var style = $(this).find("select").val();
    formData.push({ text: text, style: style });
  });

  function createAudioControls(audioURL) {
    // Create an audio element
    var audioElement = document.createElement("audio");
    audioElement.controls = true;

    // Create a source element
    var sourceElement = document.createElement("source");
    sourceElement.src = audioURL;
    sourceElement.type = "audio/wav";

    // Append the source element to the audio element
    audioElement.appendChild(sourceElement);

    // Append the audio element to the postResultDiv
    $("#postResultDiv").append(audioElement);

    $("#audioLoader").remove();
  }

  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: window.location + "generate",
    data: JSON.stringify({ text: JSON.stringify(formData) }),
    dataType: "text",
    success: function (response) {

      // const arrayBuffer = stringToArrayBuffer(response);
      // const arrayBuffer = new Uint8Array(response).buffer;
      // const blob = new Blob([btoa(response)], { type: "audio/wav" });
      // const audioURL = URL.createObjectURL(blob);\
      console.log(response);
      createAudioControls(response);
      // $("#audioSource").attr("src", response);
      // document.getElementById('audioPlayer').load()
    },
    error: function (e) {
      console.log("ERROR: ", e);
    },
  });
}
