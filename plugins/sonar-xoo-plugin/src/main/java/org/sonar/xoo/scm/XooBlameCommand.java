/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.xoo.scm;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Charsets;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.sonar.api.batch.fs.FileSystem;
import org.sonar.api.batch.fs.InputFile;
import org.sonar.api.batch.scm.BlameCommand;
import org.sonar.api.batch.scm.BlameLine;
import org.sonar.api.utils.DateUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class XooBlameCommand implements BlameCommand {

  private static final String SCM_EXTENSION = ".scm";

  @Override
  public void blame(FileSystem fs, Iterable<InputFile> files, BlameResult result) {
    for (InputFile inputFile : files) {
      processFile(inputFile, result);
    }
  }

  @VisibleForTesting
  protected void processFile(InputFile inputFile, BlameResult result) {
    File ioFile = inputFile.file();
    File scmDataFile = new java.io.File(ioFile.getParentFile(), ioFile.getName() + SCM_EXTENSION);
    if (!scmDataFile.exists()) {
      throw new IllegalStateException("Missing file " + scmDataFile);
    }

    try {
      List<String> lines = FileUtils.readLines(scmDataFile, Charsets.UTF_8.name());
      List<BlameLine> blame = new ArrayList<BlameLine>(lines.size());
      int lineNumber = 0;
      for (String line : lines) {
        lineNumber++;
        if (StringUtils.isNotBlank(line)) {
          // revision,author,dateTime
          String[] fields = StringUtils.split(line, ',');
          if (fields.length < 3) {
            throw new IllegalStateException("Not enough fields on line " + lineNumber);
          }
          String revision = fields[0];
          String author = fields[1];
          // Will throw an exception, when date is not in format "yyyy-MM-dd"
          Date date = DateUtils.parseDate(fields[2]);

          blame.add(new BlameLine(date, revision, author));
        }
      }
      result.add(inputFile, blame);
    } catch (IOException e) {
      throw new IllegalStateException(e);
    }
  }
}
