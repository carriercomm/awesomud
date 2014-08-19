package org.jarsonmar.awesomud;

import org.apache.commons.lang3.ObjectUtils;

import org.jarsonmar.awesomud.world.WorldServer;
import org.jarsonmar.awesomud.concierge.ConciergeServer;

class Runner {
   public static void main(String[] args) {
      boolean isWorld = ObjectUtils.firstNonNull(System.getProperty("awesomud.appType"), "world").equals("world");
      if (isWorld) {
         WorldServer.listen();
      }
      else {
         ConciergeServer.listen();
      }
   }
}
