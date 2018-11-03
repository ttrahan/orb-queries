var fs = require('fs');
var util = require('util');
const { exec } = require('child_process');

function queryOrbs() {
	// query production orbs from CircleCI registry
    return new Promise(function(resolve, reject) {
    	// Do async job
		exec('circleci orb list -u > data/partner-orbs/prod-orbs.txt', function(err) {
			if (err) {
				reject(err);
			} else {
				console.log("Production orbs queried from registry...") 
				resolve();
			}
		});
    })
}

function loadProdOrbs() {
	// read and prepare list of orbs
	const dataFile = './data/partner-orbs/prod-orbs.txt'
    return new Promise(function(resolve, reject) {
    	// Do async job
		fs.readFile(dataFile, 'utf8', function(err, data) {
			if (err) {
				reject(err);
			} else {
				// split prodOrbs array into namespaces and orbs/versions
				var dataByLine = data.split("\n")
				var prodOrbs = dataByLine.slice(2,-1); 
				var prodOrbsSplit = [];
				prodOrbs.forEach(function(orb) {
					prodOrbsSplit.push(orb.split("/"));
				})
				console.log('Production orbs read from file...');
				resolve(prodOrbsSplit);
			}
		});
    })
}

function loadPartners(result) {
	// load and prep list of partners >>filter production orbs by partners
	const prodOrbsSplit = result;	
	const dataFile = './data/partner-orbs/partners.txt'
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
		fs.readFile(dataFile, 'utf8', function(err, data) {
			if (err) {
				reject(err);
			} else {
				console.log('Partners read from file...');
				// convert partners list to lowercase, remove spaces, and sort
				var dataByLine = data.split("\n")
				var partners = [];
				dataByLine.slice(0,-1).forEach(function(item) {
					partners.push(item.toLowerCase().replace(/ /g,''))
				});
				partners.sort();
				console.log('\nPartners:');
				console.log(partners);
				// filter productionOrbs for partner-related orbs (produced by 
				// either CCI or partner)
				var partnerOrbsSplit = [];
				prodOrbsSplit.forEach(function(orb) {
					partners.forEach(function(partner) {
						if (orb[0].includes(partner) || (orb[1].includes(partner) 
							&& orb[0] == 'circleci')) {
							partnerOrbsSplit.push(orb);
						}
					});
				});
				resolve(partnerOrbsSplit);
			}
    	});
	});
}

function filterPartnerOrbs(result) {
    return new Promise(function(resolve, reject) {
		// filter productionOrbs for partner-related orbs, produced by 
		// either CCI or partner
		const partnerOrbsSplit = result;
		var partnerOrbs = [];
		partnerOrbsSplit.forEach(function(orb) {
			partnerOrbs.push(orb[0] + "/" + orb[1])
		});
		resolve(partnerOrbs);
	});
}

function outputPartnerOrbs(result) {
	// output
	partnerOrbs = result;	
	console.log('\nPartner-related orbs...');
	console.log(partnerOrbs);
	fs.writeFile('data/partner-orbs/partner-orbs.csv', partnerOrbs.sort(), err => {
		if (err) throw err;
	});
}

var fnlist = [ queryOrbs, loadProdOrbs, loadPartners, filterPartnerOrbs, outputPartnerOrbs ];

function main(list) {
	var p = Promise.resolve();
	return list.reduce(function(pacc, fn) {
		return pacc = pacc.then(fn);
	}, p);
}

main(fnlist);
