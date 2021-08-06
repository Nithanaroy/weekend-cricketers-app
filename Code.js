let queryParams = null;
let constants = {
  VOTING_FOLDER: "1ls13htyb29Skn5t32d8SqG4tkDdsB3_T"
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

function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

function getPage() {
  return queryParams.view || "index" // look up the `view` parameter's value
}


function * getAllVotingFormsGen() {
  const folder = DriveApp.getFolderById(constants.VOTING_FOLDER) // a folder with all voting forms
  const allForms = folder.getFilesByType(MimeType.GOOGLE_FORMS);
  while (allForms.hasNext()) {
    const form = allForms.next();
    yield form
  }
}
