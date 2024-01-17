import azure.cognitiveservices.speech as speechsdk
import sys
import ast
import os

speech_key = os.environ['AZUREKEY']
service_region = "francecentral"

speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

speech_config.speech_synthesis_voice_name = "en-US-JasonNeural"

input_str = sys.argv[1]
print(f"Received input string: {input_str}")

try:
    # Use ast.literal_eval to safely evaluate the string as a Python literal
    input_list = ast.literal_eval(input_str)
except (SyntaxError, ValueError) as e:
    print("Error: Invalid input format.")
    sys.exit(1)

# Check if the input is a list
if not isinstance(input_list, list):
    print("Error: Input must be a list.")
    sys.exit(1)
        
def generate_speak_xml(items):
    speak_template = """<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-DavisNeural">"""
    
    for item in items:
        if not isinstance(item, dict):
            print("Error: Each item in the list must be a dictionary.")
            sys.exit(1)
        text = item.get("text")
        style = item.get("style")
        if text is not None and style is not None:
            speak_template += f"""
                <mstts:express-as style="{style}">
                    {text}
                </mstts:express-as>"""
        else:
            print("Error: Each dictionary must have 'text' and 'style' keys.")
            sys.exit(1)

    speak_template += """
    </voice>
</speak>"""

    return speak_template

speak_xml = generate_speak_xml(input_list)
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
result = speech_synthesizer.speak_ssml_async(speak_xml).get()

# output in file not stream
# output_file = "output.wav"
# if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
#     audio_data = result.audio_data
#     with open(output_file, "wb") as file:
#         file.write(audio_data)
#     print(f"Audio saved to {output_file}")

if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
    audio_data = result.audio_data
    sys.stdout.buffer.write(audio_data)
else:
    sys.exit(1)