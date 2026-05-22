export const renderHome = () => {
  const div = document.createElement('div');
  div.className = 'hero';
  div.innerHTML = `
    <h1>Selamat Datang di<br>Kantin Saung Mangga</h1>
    <p>Nikmati hidangan lezat dengan suasana yang nyaman. Pesan langsung dari meja Anda dengan memindai kode QR atau melalui menu pesanan.</p>
    <a href="#/pesan" class="btn-primary">Pesan Sekarang</a>
  `;
  return div;
};
