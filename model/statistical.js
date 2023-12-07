const mongoose = require("mongoose");

const staticSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  webViews: { type: Number, default: 0 },
  appDownloads: { type: Number, default: 0 },
});

staticSchema.statics.getWeeklyPageViewsByDayOfWeek = async function () {
  const today = new Date();
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
  );
  const endOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + (7 - today.getDay()) - (today.getDay() === 0 ? 6 : 0)
  );

  const weeklyStats = await this.aggregate([
    {
      $match: {
        date: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$date" },
        webViews: { $sum: "$webViews" },
        appDownloads: { $sum: "$appDownloads" },
        date: { $first: "$date" },
      },
    },
    {
      $addFields: {
        dayOfWeek: "$_id",
        dayOfWeekName: {
          $let: {
            vars: {
              daysOfWeek: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            },
            in: { $arrayElemAt: ["$$daysOfWeek", "$_id"] },
          },
        },
        _id: 0,
      },
    },
    {
      $sort: { dayOfWeek: 1 },
    },
  ]);

  return weeklyStats;
};

const Static = new mongoose.model("Static", staticSchema);

module.exports = Static;
