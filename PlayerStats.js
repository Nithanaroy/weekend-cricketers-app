/**
 * Find the number of game days for each player
 */

const SATURDAY = 6

function closestSaturday(date) {
  // returns the date of the closest future Saturday for the given date
  const curr = new Date(date);
  while (curr.getDay() !== SATURDAY) {
    curr.setDate(curr.getDate() + 1);
  }
  return curr
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
      if (player in playerGameDays) {
        playerGameDays[player].push(gameDate)
      } else {
        playerGameDays[player] = [gameDate]
      }
    }
  }
  // Logger.log(playerGameDays)
  return playerGameDays
}

function getPlayCounts(season) {
  const playerGameDays = getPlayDaysPerPlayer()
  const playerTally = [] // list is an easier format for the UI to process
  if (season) {
    // TODO
  } else {
    for (let player in playerGameDays) {
      playerTally.push({"name": player, "days": playerGameDays[player].length})
    }
  }
  return playerTally
}