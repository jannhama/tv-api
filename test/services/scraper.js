const {
    searchSeasonNumber,
    searchEpisodeNumber,
    searchProgramName,
    formatStartDate,
} = require('../../app/services/scraper');

describe('scraper', () => {
  describe('searchSeasonNumber', () => {
    it('should find a 1 digit season number from the given string', (done) => {
      const descriptions = [
        'Kausi 2, 9/10.',
        'Kausi 2.',
        'Kausi 2, 9/10.',
        'Kausi 2,',
      ];
      descriptions.forEach((description) => {
        searchSeasonNumber(description).should.equal('2');
      });
      done();
    });

    it('should find a 2 digit season number from the given string', (done) => {
      const descriptions = [
        'Kausi 10, 9/10.',
        'Kausi 10.',
        'Kausi 10, 9/10.',
        'Kausi 10,',
      ];
      descriptions.forEach((description) => {
        searchSeasonNumber(description).should.equal('10');
      });
      done();
    });

    it('should return "-" when season number can not be found from the given string', (done) => {
      const description = 'Almanakan piilotus';
      searchSeasonNumber(description).should.equal('-');
      done();
    });
  });

  describe('searchEpisodeNumber', () => {
    it('should find a 1 digit episode number from the given string', (done) => {
      const descriptions = [
        'Jakso 1/20.',
        'jakso 1/20.',
        'Jakso 1.',
        'jakso 1.',
        'Kausi 1, 1/8.',
        'kausi 1, 1/8.',
        'Kausi 2. Jakso 1.',
        'Osa 1.',
        'osa 1.',
        'Yllätyksiä. Kausi 2, 1/8. Kiertomatka päättyy New Orleansiin, jossa tavataan Caitlynin sisko Pam. Kaupunkiin saapuu yllättäen myös Caitlynin entinen vaimo Kris Jenner, joka pääsee vertailemaan ex-miehensä luonteenpiirteitä tämän transystävien kanssa. Puheeksi tulee sekin, mitä Bruce oli kertonut sukupuoliongelmastaan aikoinaan vaimolleen. Amerikkalaisessa tositelevisiosarjassa seurataan Caitlyn Jennerin ja kumppanien matkaa transsukupuolisten asialla.',
        'Kausi 1, 1/8. On jälleen aika pukea sanomatta jääneet sanat kirjeiden muotoon. Tässä jaksossa poika lähettää kirjeen isälleen, tytär haluaa yllättää äitinsä ja vaimo haluaa kiittää miestään. Lisäksi Roope Salminen muistaa kirjeellä parasta ystäväänsä, joka on pitänyt hänet kasassa menestyksen ja pettymyksien keskellä. Uusinta.',
      ];
      descriptions.forEach((description) => {
        searchEpisodeNumber(description).should.equal('1');
      });
      done();
    });

    it('should find a 2 digit episode number from the given string', (done) => {
      const descriptions = [
        'Jakso 10/20.',
        'jakso 10/20.',
        'Kausi 3. Jakso 10/24.',
        'kausi 3. jakso 10/24.',
        'Kausi 1, 10/24.',
        'Kausi 2. Jakso 10.',
        'Osa 10.',
        'osa 10.',
        'Yllätyksiä. Kausi 2, 10/8. Kiertomatka päättyy New Orleansiin, jossa tavataan Caitlynin sisko Pam. Kaupunkiin saapuu yllättäen myös Caitlynin entinen vaimo Kris Jenner, joka pääsee vertailemaan ex-miehensä luonteenpiirteitä tämän transystävien kanssa. Puheeksi tulee sekin, mitä Bruce oli kertonut sukupuoliongelmastaan aikoinaan vaimolleen. Amerikkalaisessa tositelevisiosarjassa seurataan Caitlyn Jennerin ja kumppanien matkaa transsukupuolisten asialla.',
        'Kausi 1, 10/8. On jälleen aika pukea sanomatta jääneet sanat kirjeiden muotoon. Tässä jaksossa poika lähettää kirjeen isälleen, tytär haluaa yllättää äitinsä ja vaimo haluaa kiittää miestään. Lisäksi Roope Salminen muistaa kirjeellä parasta ystäväänsä, joka on pitänyt hänet kasassa menestyksen ja pettymyksien keskellä. Uusinta.',
      ];
      descriptions.forEach((description) => {
        searchEpisodeNumber(description).should.equal('10');
      });
      done();
    });

    it('should find episode number from a string that has "osa" and ":" characters', (done) => {
      const description = 'Osa 3070: Akin unet';
      searchEpisodeNumber(description).should.equal('3070');
      done();
    });

    it('should return "-" when episode number can not be found from the given string', (done) => {
      const description = 'Akin unet';
      searchEpisodeNumber(description).should.equal('-');
      done();
    });
  });

  describe('searchProgramName', () => {
    it('should find the program name from the given string', (done) => {
      const summaries = [
        'Eurojackpot, Jokeri ja Lomatonni (MTV3)',
        'Eurojackpot, Jokeri ja Lomatonni',
      ];
      summaries.forEach((summary) => {
        searchProgramName(summary).should.equal('Eurojackpot, Jokeri ja Lomatonni');
      });
      done();
    });
  });

  describe('formatStartDate', () => {
    it('should return formatted date when invoked with expected date string', (done) => {
      formatStartDate('2016-10-29 01:25').should.equal('2016-10-29T01:25:00+03:00');
      done();
    });

    it('should return "Invalid date" when invoked with invalid date string', (done) => {
      formatStartDate('asd').should.equal('Invalid date');
      done();
    });
  });
});
