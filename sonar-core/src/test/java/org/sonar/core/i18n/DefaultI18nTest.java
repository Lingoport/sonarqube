/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.core.i18n;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import org.junit.Before;
import org.junit.Test;
import org.sonar.api.measures.CoreMetrics;
import org.sonar.api.measures.Metric;
import org.sonar.api.utils.DateUtils;
import org.sonar.api.utils.internal.TestSystem2;
import org.sonar.core.platform.PluginInfo;
import org.sonar.core.platform.PluginRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class DefaultI18nTest {

  private TestSystem2 system2 = new TestSystem2();

  private DefaultI18n underTest;

  @Before
  public void before() {
    PluginRepository pluginRepository = mock(PluginRepository.class);
    List<PluginInfo> plugins = Arrays.asList(newPlugin("sqale"), newPlugin("frpack"), newPlugin("checkstyle"), newPlugin("other"));
    when(pluginRepository.getPluginInfos()).thenReturn(plugins);

    underTest = new DefaultI18n(pluginRepository, system2);
    underTest.doStart(getClass().getClassLoader());
  }



  private PluginInfo newPlugin(String key) {
    PluginInfo plugin = mock(PluginInfo.class);
    when(plugin.getKey()).thenReturn(key);
    return plugin;
  }
}
