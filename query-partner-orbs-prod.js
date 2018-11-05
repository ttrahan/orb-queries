const fs = require('fs');
const { exec } = require('child_process');

function queryOrbs() {
	// query production orbs from CircleCI registry
    return new Promise(function(resolve, reject) {
    	// Do async job
		exec('circleci orb list -u', function(error, stdout, stderr) {
			if (error) {
				reject(error);
			} else {
				console.log("Production orbs queried from registry...") 
				resolve(stdout);
			}
		});
    })
}

function loadProdOrbs(result) {
	// read and prepare list of orbs
	const prodOrbsRaw = result;
	// const dataFile = './data/partner-orbs/prod-orbs.txt'
    return new Promise(function(resolve, reject) {
    	// Do async job
		var prodOrbsRaw = result.split("\n")
		var prodOrbs = prodOrbsRaw.slice(2,-1); 
		var prodOrbsSplit = [];
		prodOrbs.forEach(function(orb) {
			prodOrbsSplit.push(orb.split("/"));
		})
		console.log('Production orbs read from file...');
		resolve(prodOrbsSplit);
	});
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
		resolve(partnerOrbs, partnerOrbsSplit);
	});
}

function outputPartnerOrbs(result) {
    return new Promise(function(resolve, reject) {
		// output partner orbs to console and file
		partnerOrbs = result;	
		console.log('\nPartner-related orbs:');
		console.log(partnerOrbs);
		fs.writeFile('data/partner-orbs/partner-orbs.csv', partnerOrbs.sort(), err => {
			if (err) throw err;
		});
		resolve(partnerOrbs);
	});
}

function summarizePartnerOrbs(result) {
	// summary stats for partner-related orbs 
	const partnerOrbs = result;	
	console.log('\nSummary stats:');
    const numPartnerRelatedOrbs = partnerOrbs.length;
    const numCircleciPartnerOrbs = partnerOrbs.filter(orb => orb.startsWith('circleci'));
    const numPartnerOrbs = numPartnerRelatedOrbs - numCircleciPartnerOrbs.length
	const numPartnerNamespaces = Object.create(null);
	// split partner orbs by namespace and orb
	var partnerOrbsSplit = [];
	partnerOrbs.forEach(function(orb) {
		partnerOrbsSplit.push(orb.split("/"));
	})
	// determine unique namespaces based on first 7 characters
	partnerOrbsSplit.forEach(orb => {
		numPartnerNamespaces[orb[0]] = true;
	});
	const uniqueNamespaces = Object.keys(numPartnerNamespaces);		
	let unique = [...new Set(uniqueNamespaces)];
    var unique7 = [];
	unique.forEach(function(ns) {
		unique7.push(ns.slice(0,7));
	});
	unique7 = [...new Set(unique7)];
	// remove circleci from list of unique partner namespaces
	const numUniqueNamespaces = unique7.length - 1;
	// print summary stats to console
	console.log('Number of partner-related orbs: ' + numPartnerRelatedOrbs);
	console.log('Number of partner orbs: ' + numPartnerOrbs);
	console.log('Number of CircleCI partner-related orbs: ' + numCircleciPartnerOrbs.length);
	console.log('Number of unique partner namespaces: ' + numUniqueNamespaces);
}

var fnlist = [ queryOrbs, loadProdOrbs, loadPartners, filterPartnerOrbs, 
				outputPartnerOrbs, summarizePartnerOrbs ];

function main(list) {
	var p = Promise.resolve();
	return list.reduce(function(pacc, fn) {
		return pacc = pacc.then(fn);
	}, p);
}

main(fnlist);
