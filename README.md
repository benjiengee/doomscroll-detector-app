# doomscroll-detector-app

Blocking Extension - 
 - Extracts and classifies video title from YouTube watch pages matching "https://www.youtube.com/watch"
 - Uses roberta-large model fine-tuned using Low Rank Adaptation on dataset of 1000 productive examples (MIT Courses) + 1000 unproductive examples (videos from YouTube trending)
 - Accuracy: ~0.94 when tested on manually collected test set of 250 examples with a productive probability threshold of 0.65

How to Use:
 1. Download blocking_extension folder 
 2. Chrome > Manage Extensions > Load Unpacked > blocking_extension
 3. In Terminal, run use_model.py
 4. Good to go!



Data Collection Extension - 
 - Builds labeled dataset by tracking the titles of clicked videos and prompting the user with "Is this video productive?" with each video clicked
 - User can download a csv of their collected data by clicking on the extension and clicking "Download CSV"
 - Collected data is stored locally under using chrome.storage.local

How to Use:
 1. Download data_collection_extension folder
 2. Chrome > Manage Extensions > Load Unpacked > data_collection_extension
 3. Good to go!