const fetchData = async () => {
  try {
    const response = await fetch("/admin/getStatistics");
    const data = await response.json();
    chart(sort(data.data));
  } catch (error) {
    console.log(error);
  }
};

const chart = (array) => {
  const labels = array.map((item) => item.date);
  const webViews = array.map((item) => item.webViews);
  const appDownloads = array.map((item) => item.appDownloads);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Số lượng download",
        backgroundColor: "blue",
        borderColor: "blue",
        data: appDownloads,
      },
      {
        label: "Số lượng truy cập",
        backgroundColor: "red",
        borderColor: "red",
        data: webViews,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
  };

  const canvas = document.getElementById("canvas");
  const charts = new Chart(canvas, config);
};

const sort = (arr) => {
  return arr.sort((a, b) => {
    const dateA = Date.parse(a.date.split("/").reverse().join("/"));
    const dateB = Date.parse(b.date.split("/").reverse().join("/"));
    return dateA - dateB;
  });
};

fetchData();
