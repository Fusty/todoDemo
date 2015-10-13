# todo
A simple todo app I can update from my phone (IFTTT, Google Spreadsheets, GH-Pages)

Just clone this repo in a web acessible directory and follow the instructions on screen

##Non-Setup Demo
http://fusty.github.io/todoDemo

##Overview

1.  Create a spreadsheet in google drive (preferably in a top-level directory called "IFTTT")
2.  Get the spreadsheet url id (Id in url when in the data table edit mode)
3.  Copy the script into the script editor (Start a blank project bound to this spreadsheet)
4.  Setup a trigger every minute for findRowsToProcess()
5.  Publish the Spreadsheet (sheet1 only) and Deploy the script as a web app (so only you can access it)
6.  Get the web app url
7.  Copy the web app url and spreadsheet url id into main.js
8.  Set up an IFTTT recipe to push new rows to the spreadsheet

##Text Syntax

Any text all on it's own will be put into the "task" field

Any text prefaced with "label" will be parsed into the label field (e.g. labelWork -> Work)

Any text prefaced with "urgency" will be parsed into the urgency field (e.g. urgencyHighest -> Highest)

Any text prefaced with "status" will be parsed into the status field (e.g. statusDoing -> Doing)

Default status is "Todo".  Default urgency is "Normal".

##Example

If I send the following text (includes optional hashtag that routes to my specific IFTTT recipe) 

"#todo Pick up some milk labelPersonal labelOnWayHome urgencyLow"

I'll wind up with a task with a status of Todo, task of Pick up some milk, labels Personal and OnWayHome and an urgency of Low.

Pretty simple thing I wanted to make so I'd actually use it.

##Catches

You must be logged into googe services to interact with the web app (add/delete tasks).  The apps should prompt you if you aren't.

There is no way to edit labels gracefully yet.  For now you can just edit the task and add something like "labelNewLabel" and it'll wind up in the label field.  WARNING:  This will overwrite any existing labels for that task.
