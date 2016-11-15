'use strict'

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})

// RSSM - Ridiculously Simple Storage Method 
var memories = [];

var HELP_TEXT = `
I will respond to the following messages:
\`help\` - to see this message.
\`remember\` - to remember something
\`forget\` - to forget something
\`list\` - to show the list of things I remember
\`<type-any-other-text>\` - to demonstrate a random emoticon response, some of the time :wink:.
`

//*********************************************
// Setup different handlers for messages
//*********************************************

// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(HELP_TEXT)
})

// remember something
slapp.message('remember', ['mention', 'direct_message'], (msg, text, memory) => {
  memories.push(memory);
  msg.say("OK. I now remember " + memories.length + " things.");
})

// forget something
slapp.message('forget', ['mention', 'direct_message'], (msg, text, selection) => {
  var index = parseInt(selection, 10);
  if (index >= 0 && index < memories.length) {
      memories.splice(index, 1);
  }
  msg.say("OK. I now remember " + memories.length + " things.");
})

// list things I remember
slapp.message('list', ['mention', 'direct_message'], (msg) => {
  var length = memories.length;
  var response = "I don't remember anything.";
  if (length) {  
      response = "I remember:\n";
      for (var i = 0; i < length; i++) {
          response += "" + i + ". " + memories[i] + "\n";
      }
  }
  msg.say(response);
})


// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
