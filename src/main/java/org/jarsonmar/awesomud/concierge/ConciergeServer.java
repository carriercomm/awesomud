package org.jarsonmar.awesomud.concierge;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class ConciergeServer {

   public static class ListenThread implements Runnable {
      private final Socket sock;

      public ListenThread(Socket sock) {
         this.sock = sock;
      }

      @Override
      public void run() {
         try (BufferedReader reader = new BufferedReader(
               new InputStreamReader(sock.getInputStream()));
               PrintWriter writer = new PrintWriter(
                     sock.getOutputStream(), true)) {
            writer.println("[f you]");

            int n = 0;
            while (n < 10) {
               String line = reader.readLine();
               if (null == line) {
                  System.err.println("disconnect!");
                  break;
               }
               System.err.println("Yo. Someone said:");
               System.err.println(line.trim());
               System.err.println("At time: " + n);
               System.err.println();
               n++;
            }
            writer.println("you are done!");
         } catch (IOException e) {
            System.err.println(e.getMessage());
         }
      }

   }

   public static void listen() {
      try (ServerSocket srv = new ServerSocket(6725)) {
         System.err.println("My Java is better than yours");

         while (true) {
            Socket sock = srv.accept();
            ListenThread l = new ListenThread(sock);
            new Thread(l).start();
         }
      } catch (IOException e) {
         System.err.println("disconnect?");
      }
   }
}
