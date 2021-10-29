let queryParams = null;
let constants = {
  VOTING_FOLDER: "1ls13htyb29Skn5t32d8SqG4tkDdsB3_T",
  VOTING_TEMPLATE: "1iFjH4u_kywvppgY-SEw_zHGeq_kwOq5eHh1pS5UOA0Q"
}

function doGet(e) {
  // const htmlOut = HtmlService.createHtmlOutputFromFile("index");
  queryParams = e.parameter;
  const htmlOut = HtmlService.createTemplateFromFile("index").evaluate() //.setSandboxMode(HtmlService.SandboxMode.NATIVE);
  htmlOut.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  htmlOut.setTitle("Weekend Cricketers' Voting Results")
  // htmlOut.setFaviconUrl("https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/svgs/solid/laugh-beam.svg"); // not supported type on Mobile Safari 
  return htmlOut;
}

/**
 * Create a voting sheet for the weekend where `anyDateOfTheWeek` falls in
 * Defaults to this weekend if `anyDateOfTheWeek` is not provided
 */
function generateVotingSheetForTheWeekend(anyDateOfTheWeek = new Date()) {
  const votingTemplateForm = DriveApp.getFileById(constants.VOTING_TEMPLATE)
  const votingSheetsFolder = DriveApp.getFolderById(constants.VOTING_FOLDER)
  const weekendDate = utilsModule.closestSaturday(anyDateOfTheWeek);
  const newVotingSheetName = `${weekendDate.getFullYear()}-${weekendDate.getMonth()}-${weekendDate.getDate()} Weekend`
  const thisWeekendVotingSheetsIfAny = votingSheetsFolder.getFilesByName(newVotingSheetName)
  const sheetForWeekendAlreadyExists = thisWeekendVotingSheetsIfAny.hasNext()

  let votingForm = null;
  if (sheetForWeekendAlreadyExists) {
    console.log(`Voting sheet for this weekend with the name, "${newVotingSheetName}" already exists. Reusing the same form.`)
    votingForm = FormApp.openById(thisWeekendVotingSheetsIfAny.next().getId())
  } else {
    const newVotingFormId = votingTemplateForm.makeCopy(newVotingSheetName, votingSheetsFolder).getId()
    votingForm = FormApp.openById(newVotingFormId)
  }
  const shareUrl = votingForm.getPublishedUrl()
  return votingForm.shortenFormUrl(shareUrl)
}

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

function getPage() {
  return queryParams.view || "index" // look up the `view` parameter's value
}


function* getAllVotingFormsGen() {
  const folder = DriveApp.getFolderById(constants.VOTING_FOLDER) // a folder with all voting forms
  const allForms = folder.getFilesByType(MimeType.GOOGLE_FORMS);
  while (allForms.hasNext()) {
    const form = allForms.next();
    yield form
  }
}
