/**
 * Find the number of game days for each player
 */

const SATURDAY = 6
const PLAYER_PLAY_DAYS_KEY = "playDaysByPlayer"
const PLAYER_PLAY_DAYS_UPDATED_AT_KEY = "playDaysByPlayerUpdatedAt"
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

const db = PropertiesService.getScriptProperties();

function closestSaturday(date) {
  // returns the date of the closest future Saturday for the given date
  const curr = new Date(date);
  while (curr.getDay() !== SATURDAY) {
    curr.setDate(curr.getDate() + 1);
  }
  return curr
}

function getPlayDaysPerPlayerFromCache() {
  return JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_KEY));
}

function cachePlayDaysPerPlayer(playersStats) {
  db.setProperty(PLAYER_PLAY_DAYS_KEY, JSON.stringify(playersStats))
  db.setProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY, new Date().getTime())
}

function getPlayDaysPerPlayer() {
  const playerGameDays = {} // days played by each player
  for (let form of getAllVotingFormsGen()) {
    const sat = closestSaturday(form.getDateCreated())
    const votingResults = getSessionAvailabilityForForm(form)

    // find the most popular session
    let mostPopularSessionStrength = 0
    let mostPopularSession = ""
    let attendedPlayers = []
    for (let session in votingResults) {
      let sessionStrength = votingResults[session].length
      if (sessionStrength > mostPopularSessionStrength) {
        mostPopularSessionStrength = sessionStrength
        mostPopularSession = session
        attendedPlayers = votingResults[session]
      }
    }

    // compute the date of the most popular session
    mostPopularSession = mostPopularSession.toLowerCase();
    let gameDate = new Date(3990, 7, 19) // some date that will stand out in the results
    if (mostPopularSession.indexOf("saturday") >= 0) {
      gameDate = sat
    } else if (mostPopularSession.indexOf("sunday") >= 0) {
      gameDate = new Date(sat)
      gameDate.setDate(gameDate.getDate() + 1)
    } else if (mostPopularSession.indexOf("friday") >= 0) {
      gameDate = new Date(sat)
      gameDate.setDate(gameDate.getDate() - 1)
    }

    // add the most popular date to the tally for each player who came that day
    for (let player of attendedPlayers) {
      player = player.trim()
      const gameTs = gameDate.getTime()
      if (player in playerGameDays) {
        playerGameDays[player].push(gameTs)
      } else {
        playerGameDays[player] = [gameTs]
      }
    }
  }
  // Logger.log(playerGameDays)
  return playerGameDays
}

function getPlayCounts(season, useCache = true) {
  let playerGameDays = getPlayDaysPerPlayerFromCache() || {};
  if (!useCache || Object.keys(playerGameDays).length == 0) {
    playerGameDays = getPlayDaysPerPlayer();
    cachePlayDaysPerPlayer(playerGameDays)
  }
  const playersTally = [] // list is an easier format for the UI to process
  if (season) {
    // TODO
  } else {
    for (let player in playerGameDays) {
      playersTally.push({ "name": player, "days": playerGameDays[player].length })
    }
  }
  return { playersTally, "_meta": {"updatedAt": JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY))} }
}

// ********* Tests **********
function testWriteDB() {
  db.setProperties({
    "one": JSON.stringify({ "q": [new Date().getTime()] }),
    "two": 2
  })
}

function testReadDB() {
  const res = db.getProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY)
  Logger.log(res)
  Logger.log(JSON.parse(res))
  Logger.log(parseInt(res))
}

function cleanDB() {
  db.deleteAllProperties()
}