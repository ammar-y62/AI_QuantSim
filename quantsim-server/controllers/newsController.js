exports.searchNews = (req, res) => {
     const newsReports = [
    { message: 'Meta Spends $1.2bn to hire a Software Engineer from its Competitor OpenAI' },
    { message: 'Trump Announces 80% tarrifs on India, Electronics prices expected to increase' }
  ];
  
  res.json({ newsReports });
};
