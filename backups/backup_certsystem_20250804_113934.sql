-- MySQL dump 10.13  Distrib 9.4.0, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: certsystem
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`),
  UNIQUE KEY `name_31` (`name`),
  UNIQUE KEY `name_32` (`name`),
  UNIQUE KEY `name_33` (`name`),
  UNIQUE KEY `name_34` (`name`),
  UNIQUE KEY `name_35` (`name`),
  UNIQUE KEY `name_36` (`name`),
  UNIQUE KEY `name_37` (`name`),
  UNIQUE KEY `name_38` (`name`),
  UNIQUE KEY `name_39` (`name`),
  UNIQUE KEY `name_40` (`name`),
  UNIQUE KEY `name_41` (`name`),
  UNIQUE KEY `name_42` (`name`),
  UNIQUE KEY `name_43` (`name`),
  UNIQUE KEY `name_44` (`name`),
  UNIQUE KEY `name_45` (`name`),
  UNIQUE KEY `name_46` (`name`),
  UNIQUE KEY `name_47` (`name`),
  UNIQUE KEY `name_48` (`name`),
  UNIQUE KEY `name_49` (`name`),
  UNIQUE KEY `name_50` (`name`),
  UNIQUE KEY `name_51` (`name`),
  UNIQUE KEY `name_52` (`name`),
  UNIQUE KEY `name_53` (`name`),
  UNIQUE KEY `name_54` (`name`),
  UNIQUE KEY `name_55` (`name`),
  UNIQUE KEY `name_56` (`name`),
  UNIQUE KEY `name_57` (`name`),
  UNIQUE KEY `name_58` (`name`),
  UNIQUE KEY `name_59` (`name`),
  UNIQUE KEY `name_60` (`name`),
  UNIQUE KEY `name_61` (`name`),
  UNIQUE KEY `name_62` (`name`),
  UNIQUE KEY `name_63` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('8fb7cf65-ba91-4cb1-a64b-5de09b633ffd','Web Development','Web development courses and workshops','2025-08-02 06:39:15','2025-08-02 06:39:15'),('d27c839a-3555-4b12-9edf-8043609cdd18','NPLNeural','Future of Nepal\'s AI Landscape','2025-07-30 23:50:21','2025-07-30 23:50:21');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `cert_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `recipientName` varchar(255) NOT NULL,
  `recipientEmail` varchar(255) NOT NULL,
  `certificateNumber` varchar(255) NOT NULL,
  `issueDate` datetime DEFAULT NULL,
  `templatePath` varchar(255) NOT NULL,
  `certificatePath` varchar(255) NOT NULL,
  `verificationUrl` varchar(255) NOT NULL,
  `isVerified` tinyint(1) DEFAULT '0',
  `emailSent` tinyint(1) DEFAULT '0',
  `additionalFields` json DEFAULT NULL,
  `eventId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `issuedTo` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `certificateUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cert_id`),
  UNIQUE KEY `certificateNumber` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_2` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_3` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_4` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_5` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_6` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_7` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_8` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_9` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_10` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_11` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_12` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_13` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_14` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_15` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_16` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_17` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_18` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_19` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_20` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_21` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_22` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_23` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_24` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_25` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_26` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_27` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_28` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_29` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_30` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_31` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_32` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_33` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_34` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_35` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_36` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_37` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_38` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_39` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_40` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_41` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_42` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_43` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_44` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_45` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_46` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_47` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_48` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_49` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_50` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_51` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_52` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_53` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_54` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_55` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_56` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_57` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_58` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_59` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_60` (`certificateNumber`),
  UNIQUE KEY `certificateNumber_61` (`certificateNumber`),
  KEY `eventId` (`eventId`),
  KEY `issuedTo` (`issuedTo`),
  CONSTRAINT `certificates_ibfk_121` FOREIGN KEY (`eventId`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificates_ibfk_122` FOREIGN KEY (`issuedTo`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES ('045fc31b-5cec-4455-9225-6041b5923126','John Doe','john.doe@example.com','CERT-1754276372790-OYTZSCNG1','2025-08-04 02:59:33','/Users/aashishkarki/Desktop/Web Development/theNPLCoderProject/certification_system_backend/uploads/templates/template-1754276372779.png','/Users/aashishkarki/Desktop/Web Development/theNPLCoderProject/certification_system_backend/uploads/certificates/cert-CERT-1754276372790-OYTZSCNG1.png','http://localhost:3000/api/certificates/verify/CERT-1754276372790-OYTZSCNG1',0,0,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"score\": \"95\", \"position\": \"Software Engineer\", \"organization\": \"Tech Corp\"}','5b348a43-5884-46a4-92fd-94835d82f519',NULL,'2025-08-04 02:59:33','2025-08-04 02:59:33','/uploads/certificates/cert-CERT-1754276372790-OYTZSCNG1.png'),('a2277500-5c15-43c3-a136-8f557f9b38ac','John Doe','john.doe@example.com','CERT-1754276002299-A3QNG7J37','2025-08-04 02:53:22','/Users/aashishkarki/Desktop/Web Development/theNPLCoderProject/certification_system_backend/uploads/templates/template-1754276002291.png','/Users/aashishkarki/Desktop/Web Development/theNPLCoderProject/certification_system_backend/uploads/certificates/cert-CERT-1754276002299-A3QNG7J37.png','http://localhost:3000/api/certificates/verify/CERT-1754276002299-A3QNG7J37',0,0,'{\"name\": \"John Doe\", \"email\": \"john.doe@example.com\", \"score\": \"95\", \"position\": \"Software Engineer\", \"organization\": \"Tech Corp\"}','5b348a43-5884-46a4-92fd-94835d82f519',NULL,'2025-08-04 02:53:22','2025-08-04 02:53:22','/uploads/certificates/cert-CERT-1754276002299-A3QNG7J37.png');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `eventDate` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `categoryId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES ('545f1776-8996-4aa7-81e0-b3487d5d92f2','Node.js Certification Course','Complete Node.js backend development course','2024-10-10 00:00:00','Virtual Classroom','8fb7cf65-ba91-4cb1-a64b-5de09b633ffd','2025-08-02 06:39:15','2025-08-02 06:39:15'),('5b348a43-5884-46a4-92fd-94835d82f519','GenAI Fellowship','LLMS, LangChain, LangGraph','2025-08-08 00:00:00','Kathmandu','d27c839a-3555-4b12-9edf-8043609cdd18','2025-08-02 06:36:37','2025-08-02 06:36:37'),('addfdbd2-aef1-45c2-aa85-21203cf9afa3','JavaScript Bootcamp','Intensive JavaScript programming bootcamp','2024-11-20 00:00:00','Tech Hub','8fb7cf65-ba91-4cb1-a64b-5de09b633ffd','2025-08-02 06:39:15','2025-08-02 06:39:15'),('c2f244ae-ca7a-49c0-96cc-500686132003','React.js Workshop','Advanced React.js workshop for developers','2024-12-15 00:00:00','Online','8fb7cf65-ba91-4cb1-a64b-5de09b633ffd','2025-08-02 06:39:15','2025-08-02 06:39:15');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `email_36` (`email`),
  UNIQUE KEY `email_37` (`email`),
  UNIQUE KEY `email_38` (`email`),
  UNIQUE KEY `email_39` (`email`),
  UNIQUE KEY `email_40` (`email`),
  UNIQUE KEY `email_41` (`email`),
  UNIQUE KEY `email_42` (`email`),
  UNIQUE KEY `email_43` (`email`),
  UNIQUE KEY `email_44` (`email`),
  UNIQUE KEY `email_45` (`email`),
  UNIQUE KEY `email_46` (`email`),
  UNIQUE KEY `email_47` (`email`),
  UNIQUE KEY `email_48` (`email`),
  UNIQUE KEY `email_49` (`email`),
  UNIQUE KEY `email_50` (`email`),
  UNIQUE KEY `email_51` (`email`),
  UNIQUE KEY `email_52` (`email`),
  UNIQUE KEY `email_53` (`email`),
  UNIQUE KEY `email_54` (`email`),
  UNIQUE KEY `email_55` (`email`),
  UNIQUE KEY `email_56` (`email`),
  UNIQUE KEY `email_57` (`email`),
  UNIQUE KEY `email_58` (`email`),
  UNIQUE KEY `email_59` (`email`),
  UNIQUE KEY `email_60` (`email`),
  UNIQUE KEY `email_61` (`email`),
  UNIQUE KEY `email_62` (`email`),
  UNIQUE KEY `email_63` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('3c8b2014-8f74-4dd8-a870-1c61aff70165','Test User','test@example.com','$2b$10$Fb.WZIORPEUPtVHNEkS2j.BNG8uf2NhP8OH3fAw9mvEyTrMTo9/Mi','user','2025-07-30 23:47:57','2025-07-30 23:47:57'),('79d641ca-4b8a-427e-b5dc-025c88d4af5a','Test Admin','admin@test.com','$2b$10$e3n9plneKqdTFEJDWgc22OeM1rLk88.KVKhz4tIalf.nNVqB/QZnG','admin','2025-08-02 06:39:15','2025-08-02 06:39:15'),('9718bee3-6732-4e8a-a0fe-896dd6366d95','Admin','admin@example.com','$2b$10$sR.Nm2B6DMkQ9VoGSa6d6ufOC8LfvonqXhyaFpkgWeW2V90zWkmx6','admin','2025-07-30 23:50:02','2025-07-30 23:50:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'certsystem'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-04 11:39:35
