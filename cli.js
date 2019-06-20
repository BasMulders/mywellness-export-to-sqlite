const program = require('commander');
const sqlite3 = require('sqlite3');
const slugify = require('slugify');

program
  .option('-d, --debug', 'Output debugging')
  .option('-f, --file <file>', '');

program.parse(process.argv);

if (program.debug) console.log(program.opts());

if(!program.file) {
    console.log('No file provided. Use -f or --file with a path');
    return;
}

const sourceFile = require(program.file);

if(!sourceFile.biometrics) {
    console.log('No biometrics entry present in given file');
    return;
}

const db = new sqlite3.Database('output/sqlite.db');

db.serialize(function() {
  db.run('DROP TABLE IF EXISTS biometrics');

  db.run(`CREATE TABLE biometrics(
      type TEXT,
      name TEXT,
      value INTEGER,
      measured_on DATETIME
  )`);

  sourceFile.biometrics.forEach(biometric => {
      let statement = db.prepare(`INSERT INTO biometrics VALUES(?, ?, ?, ?)`);
      statement.run(
          slugify(biometric.name, { lower: true }),
          biometric.name,
          biometric.value,
          biometric.measuredOn,
      );
      statement.finalize();
  });
});

db.close();

console.log('Import completed');