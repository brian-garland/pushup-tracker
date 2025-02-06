const getEntryForDate = (date: Date) => {
  const formattedSearchDate = format(startOfDay(date), 'yyyy-MM-dd');
  
  const foundEntry = entries.find(entry => {
    const entryDate = parseISO(entry.date);
    const formattedEntryDate = format(startOfDay(entryDate), 'yyyy-MM-dd');
    return formattedSearchDate === formattedEntryDate;
  });
  
  return foundEntry;
};

// Get last 28 days using startOfDay to normalize the time in local timezone
const today = startOfDay(new Date());

const daysToShow = eachDayOfInterval({
  start: subDays(today, 27),
  end: today,
}).map(date => startOfDay(date)); 