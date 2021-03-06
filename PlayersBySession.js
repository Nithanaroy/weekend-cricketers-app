function getTheLatestVotingFormID() {
  let latestForm = {
    form: null,
    date: new Date(1970, 1, 1)
  }
  for (let form of getAllVotingFormsGen()) {
    if (form.getLastUpdated() > latestForm.date) {
      latestForm.date = form.getLastUpdated()
      latestForm.form = form
    }
    // Logger.log("%s was created on %s (Latest form so far: %s)", form.getName(), form.getLastUpdated().toLocaleDateString(), JSON.stringify(latestForm));
  }
  return latestForm
}

function getSessionAvailabilityForForm(formMetaRef) {
  /**
   * returns, 
   * {
   *  meta: {
   *    "Voting Form": "name of the voting form"
   *  },
   *  session-name1: [player1, player2, ...],
   *  session-name2: [player1, player2, ...],
   * }
   */
  // Open a form by ID and log the responses to each question.
  var form = FormApp.openById(formMetaRef.getId());
  var formResponses = form.getResponses();
  var availabilityBySession = {}
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();
    var responder = "Unknown"
    for (var j = 0; j < itemResponses.length; j++) {
      const itemResponse = itemResponses[j];
      const question = itemResponse.getItem().getTitle().toLowerCase()
      if (question.indexOf("name") >= 0 && responder.toLowerCase() === "unknown") {
        responder = itemResponse.getResponse();
      }
      else if (question.indexOf("what times are you available?") >= 0) {
        const availabilities = itemResponse.getResponse();
        for (let availability of availabilities) {
          if (availability in availabilityBySession) {
            availabilityBySession[availability].push(responder)
          } else {
            availabilityBySession[availability] = [responder];
          }
        }
      }
      // Logger.log('Response #%s to the question "%s" was "%s"',
      // (i + 1).toString(),
      // itemResponse.getItem().getTitle(),
      // itemResponse.getResponse());
    }
  }
  // Logger.log('Response availability breakdown: %s', JSON.stringify(availabilityBySession, null, 2));
  return { "meta": { "Voting Form": formMetaRef.getName() }, ...availabilityBySession }
}

function getSessionAvailabilityForTheLatestPoll() {
  const latestForm = getTheLatestVotingFormID()
  return getSessionAvailabilityForForm(latestForm.form);
}