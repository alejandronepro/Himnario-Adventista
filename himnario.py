import sys
import threading
import os
from PyQt5.QtCore import QUrl, Qt
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView
import signal
from flask import Flask, render_template
from waitress import serve

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def run_flask_app():
    serve(app, host='localhost', port=5000)

def stop_flask_app():
    # Send SIGINT signal to the Flask app process
    os.kill(os.getpid(), signal.SIGINT)

class MainWindow(QMainWindow):
    def __init__(self):
        super(MainWindow, self).__init__()

        # Create a QWebEngineView to display the web app
        self.webview = QWebEngineView()
        self.webview.load(QUrl("http://localhost:5000"))

        # Set the web view as the central widget of the main window
        self.setCentralWidget(self.webview)

        # Show the main window
        self.show()

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

if __name__ == '__main__':
    # Create the PyQt5 application
    qtapp = QApplication(sys.argv)

    # Start the Flask web app in a separate thread using Waitress
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.start()

    # Create a QMainWindow as the main window
    window = MainWindow()
    window.showNormal()
    window.resize(1366, 768)
    window.centerOnScreen()
    window.setWindowTitle("Himnario Adventista")

    # Connect the termination of the PyQt5 app to stopping the Flask app
    qtapp.aboutToQuit.connect(stop_flask_app)

    # Start the PyQt5 event loop
    sys.exit(qtapp.exec_())
