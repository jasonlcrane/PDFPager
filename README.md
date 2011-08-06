# README for PDF Pager

PDF Pager is a jQuery plugin that allows you to page through multiple PDFs in the 
<a href="https://docs.google.com/viewer">Google Docs Viewer</a>. While the Google Docs Viewer
natively allows paging through multi-page PDFs, it does not let you hook into a page change event to do other 
stuff each time a new page displays.

# Usage
<pre>
$('#my-pdf-pager').pdfPager({
     pages: 3,
     pdfFolder: 'http://www.jasonlcrane.com/demo/pdfpager/pdfs'
});
</pre>

# Requirements
  * The plugin has two required settings: pages (the number of PDFs) and pdfFolder (an absolute path to the PDFs
  on your server).
  * The plugin depends on the PDFs being named sequentially as 1.pdf, 2.pdf, 3.pdf, etc.

# Documentation
The plugin has several other options. Check them out in the full documentation at http://www.jasonlcrane.com/2011/07/jquery-plugin-page-through-multiple-pdfs/.