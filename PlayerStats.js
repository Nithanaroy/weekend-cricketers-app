/**
 * Find the number of game days for each player
 */

const PLAYER_PLAY_DAYS_KEY = "playDaysByPlayer"
const PLAYER_PLAY_DAYS_UPDATED_AT_KEY = "playDaysByPlayerUpdatedAt"
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

const db = PropertiesService.getScriptProperties();



function getPlayDaysPerPlayerFromCache() {
  return JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_KEY));
}

function cachePlayDaysPerPlayer(playersStats) {
  db.setProperty(PLAYER_PLAY_DAYS_KEY, JSON.stringify(playersStats))
  db.setProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY, new Date().getTime())
}

// transform a player's name such that it is uniform for grouping
function resolvePlayerName(player) {
  return player.trim().toLowerCase();
}

// find the most similar name to `player` in `knownPlayers` list
// CHALLENGE: Harsha Nalajala uses Harsha as his name. Harsha Nannur used his full name. With this approach both will be merged!
function findAliasIfAny(player, knownPlayers) {
  const playerNameParts = player.split(/\s+/).map(p => p.trim())
  for(let kp of knownPlayers) {
    const kpNameParts = kp.split(/\s+/).map(p => p.trim())
    // if either of first or last names match in any order, we treat both the names belong to the same person
    const matchedNames = kpNameParts.filter(kpName => playerNameParts.filter(playerName => playerName.toLowerCase() === kpName.toLowerCase()).length > 0) // common names b/w given player and known players
    if(matchedNames.length > 0) {
      return kp
    }
  }
  return player
}

function getPlayDaysPerPlayer() {
  const playerGameDays = {} // days played by each player
  for (let form of getAllVotingFormsGen()) {
    const sat = utilsModule.closestWeekday(form.getDateCreated(), utilsModule.SATURDAY)
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
      player = resolvePlayerName(player);
      const gameTs = gameDate.getTime();
      // player = findAliasIfAny(player, Object.keys(playerGameDays))
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

function getPlayDaysPerPlayerApi(useCache = true) {
  let playerGameDays = getPlayDaysPerPlayerFromCache() || {};

  if (!useCache || Object.keys(playerGameDays).length == 0) {
    playerGameDays = getPlayDaysPerPlayer();
    cachePlayDaysPerPlayer(playerGameDays)
  }
  
  return { playerGameDays, 
    "_meta": {
      "updatedAt": JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY))
    } 
  }
}

function getPlayCounts(season, useCache = true) {
  let playerGameDays = getPlayDaysPerPlayerFromCache() || {};
  let uniqGameDays = new Set();
  const playersTally = [] // list is an easier format for the UI to process

  if (!useCache || Object.keys(playerGameDays).length == 0) {
    playerGameDays = getPlayDaysPerPlayer();
    cachePlayDaysPerPlayer(playerGameDays)
  }

  if (season && season > 0) {
    const startTs = new Date(season, 0, 1).getTime();
    const endTs = new Date(season + 1, 0, 1).getTime();
    for(let player in playerGameDays) {
      playerGameDays[player] = playerGameDays[player].filter(ts => ts >= startTs && ts <= endTs)
    }
  }

  for (let player in playerGameDays) {
    playersTally.push({ "name": player, "days": playerGameDays[player].length });
    uniqGameDays = new Set([...uniqGameDays, ...playerGameDays[player]]) // add to the existing set, aka union
  }
  
  return { playersTally, "_meta": {
      "updatedAt": JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY)),
      "totalGameDays": uniqGameDays.size
    } 
  }
}

// ********* Tests **********

function main() {
  Logger.log(findAliasIfAny("Harsha", ["Harshavardhan Nannur", "harsha nalajala"]))
}

function testWriteDB() {
  db.setProperties({
    "one": JSON.stringify({ "q": [new Date().getTime()] }),
    "two": 2
  })
}

function testReadDB() {
  const res = JSON.parse(db.getProperty(PLAYER_PLAY_DAYS_KEY))
  // const res = db.getProperty(PLAYER_PLAY_DAYS_UPDATED_AT_KEY)
  Logger.log(res)
  Logger.log(JSON.parse(res))
  Logger.log(parseInt(res))
}

function cleanDB() {
  db.deleteAllProperties()
}