function executeRequest(selectedInput) {
  var status = 'loading';
  var totalLoaded = 0

  var canvasEl = document.querySelector('#canvas');
  canvasEl.style.display = '';

  var finalChunkEl = document.querySelector('#final-chunk');
  finalChunkEl.textContent = '';

  var statusP = document.querySelector('#display-status');
  statusP.textContent = status;

  var progressP = document.querySelector('#display-progress');
  progressP.textContent = 'Progress: ';

  var finalChunkAsString = '';
  var chunkStringLengthsColumn = ['Chunk Number'];
  var dataEventCount = 0;
  window.requests(selectedInput.url, {
    headers: {
      Accept: selectedInput.accept,
    },
    streaming: true,
    parser: selectedInput.parser,
//        parser: {
//          type: ''
//          options: {
//
//          }
//        }
  })
  .on('data', function(chunk) {
    dataEventCount += 1;
    var chunkAsString = JSON.stringify(chunk);
    if (chunk !== '') {
      finalChunkAsString = chunkAsString;
    }
    var chunkAsStringLength = chunkAsString.length;
    totalLoaded += chunkAsStringLength;
    chunkStringLengthsColumn.push(chunkAsStringLength)
    window.requestAnimationFrame(function() {
      statusP.textContent = [
        status,
        '. Chunks Loaded: ',
        String(dataEventCount),
        '. Characters Loaded: ',
        String(totalLoaded),
        '.'
      ].join('');
      progressP.textContent += '|';
    });
  })
  .on('error', function(err) {
    console.error(err.message);
    console.error(err.stack);
    throw err;
  })
  .on('end', function() {
    status = 'complete';
    statusP.textContent = status;
    canvasEl.style.display = 'none';
    if (chartEnabled) {
      var chart = window.c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            chunkStringLengthsColumn
          ]
        },
        axis: {
          y: {
            label: {
              text: 'Chunk Size',
              position: 'outer-middle'
            }
          }
        }
      });
    }
    if (!finalChunkAsString || finalChunkAsString === '') {
      finalChunkAsString = 'no final chunk';
    } else {
      finalChunkAsString = finalChunkAsString.slice(0, 10 * 1000);
    }
    finalChunkEl.textContent = finalChunkAsString;
  });
}

var inputs = [{
  accept: 'text/tab-separated-values',
  url: 'http://webservice.bridgedb.org/Human/xrefs/L/4292',
  fontSize: '5px',
  parser: {
    type: 'text/tab-separated-values',
    options: {
      headers: ['identifier', 'db'],
      skipEmptyLines: true
    }
  }
}, {
  accept: 'text/tab-separated-values',
  url: 'http://webservice.bridgedb.org/Human/xrefs/L/4292',
  fontSize: '5px',
}, {
  // large file!
  accept: 'tsv',
  url: [
    'https://cdn.rawgit.com/nrnb/mirna-pathway-finder/master/',
    'wp-mir-table-builder/mir-gene-targets.txt'
  ].join(''),
  fontSize: '5px',
  parser: {
    type: 'text/tab-separated-values',
    options: {
      headers: true,
      skipEmptyLines: true
    },
    src: '../text_tab_separated_values.js',
  }
}, {
  // large file!
  accept: 'json',
  url: 'https://cdn.rawgit.com/dominictarr/JSONStream/master/test/fixtures/all_npm.json',
  fontSize: '8px',
  parser: {
    type: 'application/json',
    options: ['rows.*'],
  },
}, {
  accept: 'json',
  url: 'https://publicdata-weather.firebaseio.com/sanfrancisco/.json',
  fontSize: '8px',
}, {
  accept: 'ndjson',
  url: 'https://cdn.rawgit.com/maxogden/sqlite-search/master/test.ndjson',
  fontSize: '4px',
}, {
  url: 'https://cdn.rawgit.com/simeonackermann/VocTo/master/data/example.n3',
  fontSize: '12px',
  parser: {
    // for this content type, a noop parser is used, so the raw result is returned unparsed.
    type: 'application/octet-stream',
  },
}, {
  accept: 'n3',
  url: 'https://cdn.rawgit.com/simeonackermann/VocTo/master/data/example.n3',
  fontSize: '12px',
}, {
  // large file!
  accept: 'n3',
  url: 'https://cdn.rawgit.com/ruby-rdf/rdf-n3/develop/example-files/sp2b.n3',
  fontSize: '5px',
}, {
  accept: 'xml',
  url: [
    'https://cdn.rawgit.com/wikipathways/pvjs/master/',
    'test/input-data/troublesome-pathways/WP1243_69897.gpml'
  ].join(''),
  fontSize: '10px',
}, {
  accept: 'xml',
  url: 'https://cdn.rawgit.com/jmandel/sample_ccdas/master/HL7%20Samples/CCD.sample.xml',
  fontSize: '10px',
}];

var buttonContainer = document.querySelector('#button-container');
inputs.forEach(function(input, index) {
  var button = document.createElement('button');
  button.textContent = [
    String(index) + ') ' + input.url.split('/').pop(),
    'accept: ' + input.accept,
    'parser: ' + (!!input.parser ? input.parser.type : 'none specified')
    ].join(', ');
  button.addEventListener('click', function(e) {
    executeRequest(input);
  });
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(document.createElement('br'));
});

var chartEnabled = true;

executeRequest(inputs[0]);
