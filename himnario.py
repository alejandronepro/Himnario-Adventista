import sys
import socket
from PyQt5.QtCore import QUrl, Qt
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings
import http.server
import socketserver
import threading
import webbrowser

class MainWindow(QMainWindow):
    PORT = 8000

    def start_server(self):
        Handler = http.server.SimpleHTTPRequestHandler
        while True:
            try:
                self.httpd = socketserver.TCPServer(("", self.PORT), Handler)
                print("Server started on port", self.PORT)
                self.httpd.serve_forever()
            except OSError as e:
                if e.errno == 48:  # Address already in use
                    print(f"Port {self.PORT} is already in use. Trying a different port.")
                    self.PORT += 1  # Try the next port number
                else:
                    raise e

    def start_http_server(self):
        # Start the HTTP server in a separate thread
        server_thread = threading.Thread(target=self.start_server)
        server_thread.daemon = True
        server_thread.start()

    def __init__(self):
        super().__init__()

        # Create a web view widget
        self.web_view = QWebEngineView(self)

        # Enable JavaScript
        settings = QWebEngineSettings.globalSettings()
        settings.setAttribute(QWebEngineSettings.JavascriptEnabled, True)

        # Load the URL of the website
        self.web_view.setUrl(QUrl('http://127.0.0.1:8000/'))

        # Add the web view widget to the main window
        self.setCentralWidget(self.web_view)

    def keyPressEvent(self, event):
        if event.modifiers() == (Qt.ControlModifier | Qt.AltModifier):
            if self.windowState() & Qt.WindowFullScreen:
                self.showNormal()
                self.resize(1366, 768)  # set the window size to a reasonable value
                self.centerOnScreen()
            else:
                self.showFullScreen()
        elif event.key() == Qt.Key_Escape:
            if self.windowState() & Qt.WindowFullScreen:
                self.showNormal()
                self.resize(1366, 768)  # set the window size to a reasonable value
                self.centerOnScreen()

    def centerOnScreen(self):
        # Get the desktop widget and screen size
        desktop = QApplication.desktop()
        screen_rect = desktop.screenGeometry(desktop.primaryScreen())

        # Center the window on the screen
        window_rect = self.frameGeometry()
        window_rect.moveCenter(screen_rect.center())
        self.move(window_rect.topLeft())

    def closeEvent(self, event):
        if hasattr(self, 'httpd'):
            # Stop the HTTP server if it's running
            self.httpd.shutdown()
        event.accept()

if __name__ == '__main__':
    app = QApplication(sys.argv)

    main_window = MainWindow()
    main_window.start_http_server()
    main_window.showNormal()
    main_window.resize(1366, 768)
    main_window.centerOnScreen()

    sys.exit(app.exec_())

