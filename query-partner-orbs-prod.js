var fs = require('fs')
var dataByLine;

function initialize() {
	const dataFile = './data/prod-orbs.txt'
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
		fs.readFile(dataFile, 'utf8', function(err, data) {
			if (err) {
				reject(err);
			} else {
				var dataByLine = data.split("\n")
				resolve(dataByLine);
			}
		});
    })
}

function loadPartners() {
	const dataFile = './data/partners.txt'
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
		fs.readFile(dataFile, 'utf8', function(err, data) {
			if (err) {
				reject(err);
			} else {
				var dataByLine = data.split("\n")
				resolve(dataByLine);
			}
		});
    })
}

function main() {
    var initializePromise = initialize();
    initializePromise.then(function(result) {
        var dataByLine = result;
        // use the list of orbs
		console.log('Production orbs read from file...');
		var prodOrbs = dataByLine.slice(2,-1); 
		var prodOrbsSplit = [];
		prodOrbs.forEach(function(orb) {
			prodOrbsSplit.push(orb.split("/"));
		})
		return prodOrbsSplit;
    }, function(err) {
        console.log(err);
	}).then(function(result) {
		var prodOrbsSplit = result;
        var loadPartnersPromise = loadPartners();
		loadPartnersPromise.then(function(result) {
		    console.log('Partners read from file...');
			// convert partners list to lowercase and sort
			const partners = [];
			result.slice(0,-1).forEach(function(item) {
				partners.push(item.toLowerCase())
			});
			partners.sort();
			var partnerOrbsSplit = [];
			prodOrbsSplit.forEach(function(orb) {
				partners.forEach(function(partner) {
					if (orb[0].includes(partner) || (orb[1].includes(partner) && orb[0] == 'circleci')) {
						partnerOrbsSplit.push(orb);
					};
				})
			});
			var partnerOrbs = [];
			partnerOrbsSplit.forEach(function(orb) {
				partnerOrbs.push(orb[0] + "/" + orb[1])
			})
			console.log(partnerOrbs);
			fs.writeFile('partner-orbs.csv', partnerOrbs.sort(), err => {
				if (err) throw err;
			});
		}), function(err) {
			console.log(err);
		}
	})
};

main();
