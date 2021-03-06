# Dreimonatsfrist

Calendar that automatically marks dates, regarding time limits for travel expenses deductions.

*German:*  
Kalendar der automatisch Reisetermine markiert, die außerhalb der Dreimonatsfrist bezüglich Abzug der Verpflegungsmehraufwendungen liegen.  
Siehe [§ 9 Abs. 4a Sätze 6 und 7 EStG](https://www.gesetze-im-internet.de/estg/__9.html).

![Recording](https://cloud.githubusercontent.com/assets/3826929/24327815/cf8fb818-11da-11e7-8007-a50c601a7c38.gif)



## Building
Download dependencies:
```sh
$ npm install
```

Build production (minified):
```sh
$ npm run build
```

Automatically build on save:
```sh
$ npm run watch
```

## Database Format
The database is accessed via restful queries (see [dbconnection.js](app/js/dbconnection.js)).

When using the MySQL webservices ([entries.php](service/entries.php), [locations.php](service/locations.php), [users.php](service/users.php)), the database should look like this:

```SQL
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `Entry` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `User` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Location` int(11) NOT NULL,
  `LocationSupplement` varchar(2) COLLATE utf8_bin DEFAULT NULL,
  `Comment` text COLLATE utf8_bin,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `User` (`User`,`Date`),
  KEY `Location` (`Location`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `Location` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` text COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS `User` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` text COLLATE utf8_bin NOT NULL,
  `Vorname` text COLLATE utf8_bin NOT NULL,
  `Firma` text COLLATE utf8_bin NOT NULL,
  `Kostenstelle` text COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

ALTER TABLE `Entry`
  ADD CONSTRAINT `Entry_ibfk_1` FOREIGN KEY (`User`) REFERENCES `User` (`ID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Entry_ibfk_2` FOREIGN KEY (`Location`) REFERENCES `Location` (`ID`) ON UPDATE CASCADE;
```
